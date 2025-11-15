import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRequest {
  tipo?: 'periodo' | 'chave';
  dataInicial?: string; // YYYY-MM-DD
  dataFinal?: string;   // YYYY-MM-DD
  chaveAcesso?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { tipo = 'periodo', dataInicial, dataFinal, chaveAcesso }: ImportRequest = await req.json();

    const brasilNFeToken = Deno.env.get('BRASILNFE_API_TOKEN');
    if (!brasilNFeToken) {
      throw new Error('Token BrasilNFe não configurado');
    }

    console.log('Iniciando busca de CT-es na BrasilNFe...', { tipo, dataInicial, dataFinal, chaveAcesso });

    let apiUrl = 'https://api.brasilnfe.com.br/v2/cte/consulta';
    let body: any = {};

    if (tipo === 'chave' && chaveAcesso) {
      body.chave = chaveAcesso;
    } else if (tipo === 'periodo' && dataInicial && dataFinal) {
      body.data_inicial = dataInicial;
      body.data_final = dataFinal;
    } else {
      throw new Error('Parâmetros de busca inválidos');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Token': brasilNFeToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API BrasilNFe:', response.status, errorText);
      throw new Error(`Erro na API BrasilNFe: ${response.status} - ${errorText}`);
    }

    const apiData = await response.json();
    console.log('Resposta da API BrasilNFe:', apiData);

    // A estrutura da resposta pode variar, ajuste conforme necessário
    const ctes = Array.isArray(apiData) ? apiData : (apiData.ctes || [apiData]);
    
    if (!ctes || ctes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum CT-e encontrado no período', 
          imported: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const importedCtes = [];
    const errors = [];

    for (const cteData of ctes) {
      try {
        // Extrair dados do CT-e da resposta da API
        const infCte = cteData.CTe?.infCte || cteData.infCte;
        if (!infCte) {
          console.error('Estrutura de CT-e inválida:', cteData);
          errors.push({ error: 'Estrutura inválida', data: cteData });
          continue;
        }

        const ide = infCte.ide;
        const emit = infCte.emit;
        const dest = infCte.dest || infCte.receb;
        const vPrest = infCte.vPrest;
        const infCarga = infCte.infCarga;
        const infModal = infCte.infModal || infCte.infCTeNorm?.infModal;

        // Verificar se CT-e já existe
        const { data: existing } = await supabaseClient
          .from('cte')
          .select('id')
          .eq('chave_acesso', infCte['@_Id']?.replace('CTe', ''))
          .single();

        if (existing) {
          console.log('CT-e já importado:', infCte['@_Id']);
          continue;
        }

        // Preparar dados para inserção
        const cteInsert = {
          numero_cte: ide.nCT,
          serie: ide.serie,
          chave_acesso: infCte['@_Id']?.replace('CTe', ''),
          data_emissao: ide.dhEmi,
          tipo_cte: ide.tpCTe === '0' ? 'Normal' : 'Complementar',
          modal: ide.modal === '01' ? 'Rodoviário' : 'Outros',
          tipo_servico: ide.tpServ === '0' ? 'Normal' : 'Outros',
          
          // Remetente
          remetente_cnpj: emit.CNPJ,
          remetente_nome: emit.xNome,
          remetente_endereco: `${emit.enderEmit?.xLgr}, ${emit.enderEmit?.nro}`,
          remetente_cidade: emit.enderEmit?.xMun,
          remetente_uf: emit.enderEmit?.UF,
          remetente_cep: emit.enderEmit?.CEP,
          
          // Destinatário
          destinatario_cnpj: dest?.CNPJ,
          destinatario_nome: dest?.xNome,
          destinatario_endereco: `${dest?.enderDest?.xLgr || ''}, ${dest?.enderDest?.nro || ''}`,
          destinatario_cidade: dest?.enderDest?.xMun,
          destinatario_uf: dest?.enderDest?.UF,
          destinatario_cep: dest?.enderDest?.CEP,
          
          // Tomador
          tomador_tipo: ide.toma3?.toma || ide.toma4?.toma || '0',
          tomador_cnpj: emit.CNPJ, // Por padrão, usar o remetente
          tomador_nome: emit.xNome,
          
          // Valores
          valor_total: parseFloat(vPrest?.vTPrest || '0'),
          valor_frete: parseFloat(vPrest?.vRec || '0'),
          valor_mercadoria: parseFloat(infCarga?.vCarga || '0'),
          
          // Carga
          peso_bruto: parseFloat(infCarga?.vCarga || '0'),
          quantidade_volumes: parseInt(infCarga?.qCarga || '0'),
          produto_predominante: infCarga?.proPred || 'Não especificado',
          
          // Veículo
          placa_veiculo: infModal?.rodo?.veicTracao?.placa || 'N/A',
          uf_veiculo: infModal?.rodo?.veicTracao?.UF || 'N/A',
          placa_carreta: infModal?.rodo?.veicReboque?.[0]?.placa,
          
          // Tipo de frete
          tipo_frete: ide.tpServ === '0' ? 'CIF' : 'FOB',
          
          status: 'autorizado',
          created_by: user.id
        };

        const { data: inserted, error: insertError } = await supabaseClient
          .from('cte')
          .insert(cteInsert)
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao inserir CT-e:', insertError);
          errors.push({ numero: ide.nCT, error: insertError.message });
        } else {
          importedCtes.push(inserted);
          console.log('CT-e importado:', ide.nCT);
        }

      } catch (error) {
        console.error('Erro ao processar CT-e:', error);
        errors.push({ error: error instanceof Error ? error.message : String(error), data: cteData });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `${importedCtes.length} CT-e(s) importado(s) com sucesso`,
        imported: importedCtes.length,
        total: ctes.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função import-cte-brasilnfe:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
