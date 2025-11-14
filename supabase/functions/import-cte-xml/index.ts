import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CTEDataFromXML {
  numero_cte: string;
  chave_acesso: string;
  data_emissao: string;
  remetente_nome: string;
  remetente_cnpj: string;
  remetente_endereco: string;
  remetente_cidade: string;
  remetente_uf: string;
  remetente_cep: string;
  destinatario_nome: string;
  destinatario_cnpj: string;
  destinatario_endereco: string;
  destinatario_cidade: string;
  destinatario_uf: string;
  destinatario_cep: string;
  tomador_tipo: string;
  tomador_nome: string;
  tomador_cnpj: string;
  produto_predominante: string;
  peso_bruto: number;
  quantidade_volumes: number;
  valor_mercadoria: number;
  valor_frete: number;
  valor_total: number;
  placa_veiculo: string;
  uf_veiculo: string;
  tipo_frete: string;
  modal: string;
  data_vencimento?: string;
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

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Não autorizado')
    }

    const { xml_content } = await req.json()

    if (!xml_content) {
      throw new Error('Conteúdo XML é obrigatório')
    }

    console.log('Processando XML de CT-e...')

    const cteData = parseXML(xml_content)

    // Verificar se cliente existe, senão criar
    const { data: existingClient } = await supabaseClient
      .from('clients')
      .select('cnpj')
      .eq('cnpj', cteData.tomador_cnpj)
      .maybeSingle()

    if (!existingClient) {
      console.log('Cliente não encontrado, criando novo...')
      await supabaseClient
        .from('clients')
        .insert({
          cnpj: cteData.tomador_cnpj,
          razao_social: cteData.tomador_nome,
          nome_fantasia: cteData.tomador_nome,
          created_by: user.id
        })
    }

    // Inserir CT-e
    const { data: cteInserted, error: insertError } = await supabaseClient
      .from('cte')
      .insert([{
        numero_cte: cteData.numero_cte,
        serie: '1',
        tipo_cte: '0',
        tipo_servico: '0',
        chave_acesso: cteData.chave_acesso,
        data_emissao: cteData.data_emissao,
        remetente_nome: cteData.remetente_nome,
        remetente_cnpj: cteData.remetente_cnpj,
        remetente_endereco: cteData.remetente_endereco,
        remetente_cidade: cteData.remetente_cidade,
        remetente_uf: cteData.remetente_uf,
        remetente_cep: cteData.remetente_cep,
        destinatario_nome: cteData.destinatario_nome,
        destinatario_cnpj: cteData.destinatario_cnpj,
        destinatario_endereco: cteData.destinatario_endereco,
        destinatario_cidade: cteData.destinatario_cidade,
        destinatario_uf: cteData.destinatario_uf,
        destinatario_cep: cteData.destinatario_cep,
        tomador_tipo: cteData.tomador_tipo,
        tomador_nome: cteData.tomador_nome,
        tomador_cnpj: cteData.tomador_cnpj,
        produto_predominante: cteData.produto_predominante,
        peso_bruto: cteData.peso_bruto,
        quantidade_volumes: cteData.quantidade_volumes,
        valor_mercadoria: cteData.valor_mercadoria,
        valor_frete: cteData.valor_frete,
        valor_total: cteData.valor_total,
        placa_veiculo: cteData.placa_veiculo,
        uf_veiculo: cteData.uf_veiculo,
        tipo_frete: cteData.tipo_frete,
        modal: cteData.modal,
        status: 'autorizado',
        status_pagamento: 'pendente',
        data_vencimento: cteData.data_vencimento,
        created_by: user.id
      }])
      .select()

    if (insertError) {
      console.error('Erro ao inserir CT-e:', insertError)
      throw insertError
    }

    console.log('CT-e importado com sucesso:', cteInserted)

    // Atualizar análise financeira
    await supabaseClient.rpc('calculate_client_financial_analysis')

    return new Response(
      JSON.stringify({ success: true, data: cteInserted }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Erro na importação:', error)
    return new Response(
      JSON.stringify({ error: error?.message || 'Erro desconhecido' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function parseXML(xmlContent: string): CTEDataFromXML {
  const extractValue = (tag: string, regex?: RegExp): string => {
    const pattern = regex || new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
    const match = xmlContent.match(pattern)
    return match ? match[1].trim() : ''
  }

  const extractNumeric = (tag: string, regex?: RegExp): number => {
    const value = extractValue(tag, regex)
    return value ? parseFloat(value.replace(',', '.')) : 0
  }

  const chaveAcesso = extractValue('chCTe') || extractValue('Id').replace('CTe', '')
  const numeroCte = extractValue('nCT')
  const dataEmissao = extractValue('dhEmi')

  const remCNPJ = xmlContent.match(/<rem>.*?<CNPJ>(.*?)<\/CNPJ>/s)?.[1] || ''
  const remNome = xmlContent.match(/<rem>.*?<xNome>(.*?)<\/xNome>/s)?.[1] || ''
  const remEndereco = xmlContent.match(/<rem>.*?<xLgr>(.*?)<\/xLgr>/s)?.[1] || ''
  const remCidade = xmlContent.match(/<rem>.*?<xMun>(.*?)<\/xMun>/s)?.[1] || ''
  const remUF = xmlContent.match(/<enderReme>.*?<UF>(.*?)<\/UF>/s)?.[1] || ''
  const remCEP = xmlContent.match(/<enderReme>.*?<CEP>(.*?)<\/CEP>/s)?.[1] || ''

  const destCNPJ = xmlContent.match(/<dest>.*?<CNPJ>(.*?)<\/CNPJ>/s)?.[1] || ''
  const destNome = xmlContent.match(/<dest>.*?<xNome>(.*?)<\/xNome>/s)?.[1] || ''
  const destEndereco = xmlContent.match(/<dest>.*?<xLgr>(.*?)<\/xLgr>/s)?.[1] || ''
  const destCidade = xmlContent.match(/<dest>.*?<xMun>(.*?)<\/xMun>/s)?.[1] || ''
  const destUF = xmlContent.match(/<enderDest>.*?<UF>(.*?)<\/UF>/s)?.[1] || ''
  const destCEP = xmlContent.match(/<enderDest>.*?<CEP>(.*?)<\/CEP>/s)?.[1] || ''

  const tomadorTipo = extractValue('toma4') || '0'
  const tomadorCNPJ = xmlContent.match(/<toma4>.*?<CNPJ>(.*?)<\/CNPJ>/s)?.[1] || remCNPJ
  const tomadorNome = xmlContent.match(/<toma4>.*?<xNome>(.*?)<\/xNome>/s)?.[1] || remNome

  const produto = extractValue('proPred') || 'Diversos'
  const pesoBruto = extractNumeric('qCarga')
  const volumes = parseInt(extractValue('qCarga')) || 1
  const valorMercadoria = extractNumeric('vCarga')
  const valorFrete = extractNumeric('vTPrest')
  const valorTotal = extractNumeric('vRec')

  const placaVeiculo = extractValue('placa')
  const ufVeiculo = extractValue('UF', /<veicTracao>.*?<UF>(.*?)<\/UF>/s)
  const tipoFrete = extractValue('tpServ') === '1' ? 'fob' : 'cif'
  const modal = 'rodoviario'

  let dataVencimento = ''
  if (dataEmissao) {
    const emissaoDate = new Date(dataEmissao)
    emissaoDate.setDate(emissaoDate.getDate() + 30)
    dataVencimento = emissaoDate.toISOString()
  }

  return {
    numero_cte: numeroCte,
    chave_acesso: chaveAcesso,
    data_emissao: dataEmissao,
    remetente_nome: remNome,
    remetente_cnpj: remCNPJ,
    remetente_endereco: remEndereco,
    remetente_cidade: remCidade,
    remetente_uf: remUF,
    remetente_cep: remCEP,
    destinatario_nome: destNome,
    destinatario_cnpj: destCNPJ,
    destinatario_endereco: destEndereco,
    destinatario_cidade: destCidade,
    destinatario_uf: destUF,
    destinatario_cep: destCEP,
    tomador_tipo: tomadorTipo,
    tomador_nome: tomadorNome,
    tomador_cnpj: tomadorCNPJ,
    produto_predominante: produto,
    peso_bruto: pesoBruto,
    quantidade_volumes: volumes,
    valor_mercadoria: valorMercadoria,
    valor_frete: valorFrete,
    valor_total: valorTotal,
    placa_veiculo: placaVeiculo,
    uf_veiculo: ufVeiculo,
    tipo_frete: tipoFrete,
    modal: modal,
    data_vencimento: dataVencimento
  }
}
