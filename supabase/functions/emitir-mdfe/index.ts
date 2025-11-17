import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('Unauthorized');

    const mdfeData = await req.json();

    // Buscar dados do emitente
    const emitenteCnpj = Deno.env.get('EMITENTE_CNPJ');
    const emitenteRazao = Deno.env.get('EMITENTE_RAZAO_SOCIAL');
    const emitenteFantasia = Deno.env.get('EMITENTE_FANTASIA');
    const emitenteIe = Deno.env.get('EMITENTE_IE');
    const emitenteEndereco = Deno.env.get('EMITENTE_ENDERECO');
    const emitenteCep = Deno.env.get('EMITENTE_CEP');
    const emitenteMunicipio = Deno.env.get('EMITENTE_MUNICIPIO');
    const emitenteUf = Deno.env.get('EMITENTE_UF');
    const emitenteRntrc = Deno.env.get('EMITENTE_RNTRC');
    const brasilnfeToken = Deno.env.get('BRASILNFE_API_TOKEN');
    const ambiente = Deno.env.get('BRASILNFE_AMBIENTE') || 'homologacao';

    // Montar payload do MDF-e
    const payload = {
      tipo_emitente: mdfeData.tipo_emitente || "2", // 2=Transportadora de carga própria
      tipo_transportador: mdfeData.tipo_transportador || "1", // 1=ETC
      modelo: "58",
      serie: mdfeData.serie || "1",
      numero: mdfeData.numero,
      data_emissao: mdfeData.data_emissao || new Date().toISOString(),
      uf_inicio: mdfeData.uf_inicio,
      uf_fim: mdfeData.uf_fim,
      modal: mdfeData.modal || "1", // 1=Rodoviário
      
      // Emitente
      emitente: {
        cnpj: emitenteCnpj,
        razao_social: emitenteRazao,
        nome_fantasia: emitenteFantasia,
        inscricao_estadual: emitenteIe,
        endereco: emitenteEndereco,
        municipio: emitenteMunicipio,
        uf: emitenteUf,
        cep: emitenteCep,
      },

      // Modal Rodoviário
      modal_rodoviario: {
        rntrc: emitenteRntrc,
        ciot: mdfeData.ciot || [],
        
        // Veículo de tração
        veiculo_tracao: {
          placa: mdfeData.placa_cavalo,
          uf: mdfeData.uf_cavalo || emitenteUf,
          renavam: mdfeData.renavam_cavalo || "",
          tara: mdfeData.tara_cavalo || 0,
          capacidade_kg: mdfeData.capacidade_kg_cavalo || 0,
          tipo_rodado: mdfeData.tipo_rodado || "02",
          tipo_carroceria: mdfeData.tipo_carroceria || "00",
        },

        // Veículos de reboque (carretas)
        veiculos_reboque: mdfeData.carretas || [],

        // Condutores
        condutores: mdfeData.condutores || [],
      },

      // Documentos vinculados (CT-es)
      documentos: mdfeData.ctes || [],

      // Percurso
      percurso: mdfeData.ufs_percurso || [],

      // Informações da carga
      totalizadores: {
        quantidade_cte: mdfeData.quantidade_ctes || 0,
        peso_bruto: mdfeData.peso_bruto || 0,
        valor_carga: mdfeData.valor_carga || 0,
      },

      // Seguro
      seguro: mdfeData.seguro || null,

      // Informações adicionais
      informacoes_adicionais: mdfeData.informacoes_adicionais || "",
      informacoes_complementares: mdfeData.informacoes_complementares || "",
    };

    console.log('Enviando MDF-e para Brasil NFe:', JSON.stringify(payload, null, 2));

    const brasilnfeResponse = await fetch(
      `https://api.brasilnfe.com.br/mdfe/${ambiente === 'producao' ? 'producao' : 'homologacao'}`,
      {
        method: 'POST',
        headers: {
          'Token': brasilnfeToken!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await brasilnfeResponse.json();
    console.log('Resposta Brasil NFe MDF-e:', JSON.stringify(responseData, null, 2));

    if (!brasilnfeResponse.ok) {
      throw new Error(`Brasil NFe error: ${JSON.stringify(responseData)}`);
    }

    // Salvar no banco
    const { data: mdfeRecord, error: dbError } = await supabase
      .from('mdfe')
      .insert({
        numero_mdfe: mdfeData.numero,
        serie: mdfeData.serie || "1",
        chave_acesso: responseData.chave || null,
        protocolo_autorizacao: responseData.protocolo || null,
        data_emissao: mdfeData.data_emissao || new Date().toISOString(),
        data_autorizacao: responseData.data_autorizacao || null,
        status: responseData.status || 'processando',
        modal: mdfeData.modal || "1",
        tipo_emitente: mdfeData.tipo_emitente || "2",
        tipo_transportador: mdfeData.tipo_transportador || "1",
        emitente_cnpj: emitenteCnpj!,
        emitente_razao_social: emitenteRazao!,
        emitente_nome_fantasia: emitenteFantasia!,
        emitente_ie: emitenteIe,
        emitente_endereco: emitenteEndereco,
        emitente_cidade: emitenteMunicipio,
        emitente_uf: emitenteUf!,
        emitente_cep: emitenteCep,
        uf_inicio: mdfeData.uf_inicio,
        uf_fim: mdfeData.uf_fim,
        ufs_percurso: mdfeData.ufs_percurso || [],
        veiculo_tracao_placa: mdfeData.placa_cavalo,
        veiculo_tracao_uf: mdfeData.uf_cavalo || emitenteUf!,
        veiculo_tracao_rntrc: emitenteRntrc,
        veiculos_reboque: mdfeData.carretas || [],
        condutores: mdfeData.condutores || [],
        quantidade_ctes: mdfeData.quantidade_ctes || 0,
        quantidade_nfes: mdfeData.quantidade_nfes || 0,
        peso_total_kg: mdfeData.peso_bruto || 0,
        valor_total_carga: mdfeData.valor_carga || 0,
        ctes_vinculados: mdfeData.ctes || [],
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar MDF-e:', dbError);
      throw dbError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        mdfe_id: mdfeRecord.id,
        numero: mdfeData.numero,
        chave: responseData.chave,
        protocolo: responseData.protocolo,
        pdf_url: responseData.pdf,
        xml_url: responseData.xml,
        status: responseData.status,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao emitir MDF-e:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
