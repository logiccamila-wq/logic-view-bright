import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { ordem_id } = await req.json()

    // Buscar dados da ordem
    const { data: ordem, error } = await supabaseClient
      .from('ordem_coleta')
      .select('*')
      .eq('id', ordem_id)
      .single()

    if (error) throw error

    // Gerar HTML da ordem de coleta
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: white;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 150px;
          }
          .title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            text-decoration: underline;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 8px;
          }
          .info-line {
            margin-bottom: 5px;
            line-height: 1.6;
          }
          .signature-area {
            margin-top: 80px;
            border-top: 1px solid #000;
            padding-top: 10px;
            text-align: center;
            width: 300px;
            margin-left: auto;
            margin-right: auto;
          }
          .footer {
            margin-top: 60px;
            text-align: center;
            border-top: 2px solid #000;
            padding-top: 10px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="width: 150px;"></div>
          <div class="title">ORDEM DE COLETA</div>
          <div style="width: 150px; text-align: right;">
            <strong>Nº ${ordem.numero_ordem}</strong>
          </div>
        </div>

        <div class="section">
          <div class="section-title">FORNECEDOR</div>
          <div class="info-line">${ordem.fornecedor_nome} / ${ordem.fornecedor_uf || ''}</div>
        </div>

        <div class="section">
          <div class="section-title">TRANSPORTADORA</div>
          <div class="info-line">${ordem.transportadora_nome}</div>
          <div class="info-line">CNPJ: ${ordem.transportadora_cnpj}</div>
          <div class="info-line">${ordem.transportadora_cidade} – ${ordem.transportadora_uf}</div>
        </div>

        <div class="section">
          <div class="section-title">Destino / CLIENTE</div>
          <div class="info-line">${ordem.cliente_nome}</div>
          <div class="info-line">CNPJ: ${ordem.cliente_cnpj}</div>
        </div>

        <div class="section">
          <div class="section-title">Motorista</div>
          <div class="info-line">${ordem.motorista_nome}</div>
          ${ordem.motorista_telefone ? `<div class="info-line">${ordem.motorista_telefone}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Placas Caminhão</div>
          <div class="info-line">CAVALO: ${ordem.placa_cavalo}</div>
          ${ordem.placa_carreta ? `<div class="info-line">CARRETA: ${ordem.placa_carreta}</div>` : ''}
          ${ordem.capacidade_carreta ? `<div class="info-line">CAPACIDADE DA CARRETA: ${ordem.capacidade_carreta}</div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">PRODUTO: ${ordem.produto}</div>
        </div>

        ${ordem.pedido_venda ? `
        <div class="section">
          <div class="section-title">PEDIDO DE VENDA: ${ordem.pedido_venda}</div>
        </div>
        ` : ''}

        <div class="signature-area">
          ${ordem.transportadora_nome}
        </div>

        <div class="footer">
          ${ordem.transportadora_nome}
        </div>
      </body>
      </html>
    `

    return new Response(
      JSON.stringify({ html }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})