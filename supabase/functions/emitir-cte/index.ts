import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { buildCorsHeaders, handlePreflight } from "../_shared/cors.ts";
import { logFunction } from "../_shared/correlation.ts";

const getCors = (origin: string | null) => buildCorsHeaders(origin);

serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return handlePreflight(origin);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error('Unauthorized');

    const cteData = await req.json();

    // Buscar dados do emitente dos secrets
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

    // Montar JSON do CT-e para Brasil NFe
    const payload = {
      natureza_operacao: cteData.natureza_operacao || "PRESTACAO DE SERVICO DE TRANSPORTE",
      tipo_cte: cteData.tipo_cte || "0", // 0=Normal
      modelo: "57",
      serie: cteData.serie || "1",
      numero: cteData.numero,
      data_emissao: cteData.data_emissao || new Date().toISOString(),
      tipo_servico: cteData.tipo_servico || "0", // 0=Normal
      municipio_envio: emitenteMunicipio,
      municipio_inicio: cteData.municipio_origem,
      municipio_fim: cteData.municipio_destino,
      uf_envio: emitenteUf,
      uf_inicio: cteData.uf_origem,
      uf_fim: cteData.uf_destino,
      modal: cteData.modal || "01", // 01=Rodoviário
      tipo_tomador: cteData.tipo_tomador || "0", // 0=Remetente
      
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

      // Tomador
      tomador: {
        tipo: cteData.tipo_tomador || "0",
        cnpj: cteData.tomador_cnpj,
        razao_social: cteData.tomador_razao,
        inscricao_estadual: cteData.tomador_ie || "",
        endereco: cteData.tomador_endereco,
        municipio: cteData.tomador_municipio,
        uf: cteData.tomador_uf,
        cep: cteData.tomador_cep,
        telefone: cteData.tomador_telefone || "",
      },

      // Remetente
      remetente: {
        cnpj: cteData.remetente_cnpj,
        razao_social: cteData.remetente_razao,
        inscricao_estadual: cteData.remetente_ie || "",
        endereco: cteData.remetente_endereco,
        municipio: cteData.remetente_municipio,
        uf: cteData.remetente_uf,
        cep: cteData.remetente_cep,
      },

      // Destinatário
      destinatario: {
        cnpj: cteData.destinatario_cnpj,
        razao_social: cteData.destinatario_razao,
        inscricao_estadual: cteData.destinatario_ie || "",
        endereco: cteData.destinatario_endereco,
        municipio: cteData.destinatario_municipio,
        uf: cteData.destinatario_uf,
        cep: cteData.destinatario_cep,
      },

      // Valores
      valores: {
        valor_total: cteData.valor_total,
        valor_receber: cteData.valor_total,
        valor_total_carga: cteData.valor_carga,
      },

      // Impostos
      impostos: {
        icms: {
          situacao_tributaria: cteData.icms_situacao || "00",
          valor_base_calculo: cteData.valor_total * 0.9,
          aliquota: cteData.icms_aliquota || 12,
          valor: (cteData.valor_total * 0.9 * (cteData.icms_aliquota || 12)) / 100,
        },
      },

      // Produto predominante
      produto_predominante: cteData.produto_predominante || "PRODUTOS QUIMICOS",
      
      // Carga
      carga: {
        valor: cteData.valor_carga,
        produto_predominante: cteData.produto_predominante || "PRODUTOS QUIMICOS",
        quantidade_volumes: cteData.quantidade_volumes || 1,
        peso_bruto: cteData.peso_bruto,
      },

      // Modal Rodoviário
      modal_rodoviario: {
        rntrc: emitenteRntrc,
        veiculos: [
          {
            placa: cteData.placa_veiculo,
            uf: cteData.uf_veiculo,
            renavam: cteData.renavam || "",
            tara: cteData.tara || 0,
            capacidade_kg: cteData.capacidade_kg || 0,
            tipo_rodado: cteData.tipo_rodado || "02",
            tipo_carroceria: cteData.tipo_carroceria || "00",
          },
        ],
      },

      // Informações adicionais
      informacoes_adicionais_fisco: cteData.informacoes_fisco || "",
      informacoes_complementares: cteData.informacoes_complementares || "",
    };

    // Enviar para Brasil NFe
    console.log('Enviando CT-e para Brasil NFe:', JSON.stringify(payload, null, 2));
    
    const brasilnfeResponse = await fetch(
      `https://api.brasilnfe.com.br/cte/${ambiente === 'producao' ? 'producao' : 'homologacao'}`,
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
    console.log('Resposta Brasil NFe:', JSON.stringify(responseData, null, 2));

    if (!brasilnfeResponse.ok) {
      throw new Error(`Brasil NFe error: ${JSON.stringify(responseData)}`);
    }

    // Salvar no banco
    const { data: cteRecord, error: dbError } = await supabase
      .from('cte')
      .insert({
        numero_cte: cteData.numero,
        serie: cteData.serie || "1",
        chave_acesso: responseData.chave || null,
        protocolo_autorizacao: responseData.protocolo || null,
        data_emissao: cteData.data_emissao || new Date().toISOString(),
        data_autorizacao: responseData.data_autorizacao || null,
        status: responseData.status || 'processando',
        modal: cteData.modal || "01",
        tipo_cte: cteData.tipo_cte || "0",
        tipo_servico: cteData.tipo_servico || "0",
        tipo_frete: "0",
        remetente_cnpj: cteData.remetente_cnpj,
        remetente_nome: cteData.remetente_razao,
        remetente_endereco: cteData.remetente_endereco,
        remetente_cidade: cteData.remetente_municipio,
        remetente_uf: cteData.remetente_uf,
        remetente_cep: cteData.remetente_cep,
        destinatario_cnpj: cteData.destinatario_cnpj,
        destinatario_nome: cteData.destinatario_razao,
        destinatario_endereco: cteData.destinatario_endereco,
        destinatario_cidade: cteData.destinatario_municipio,
        destinatario_uf: cteData.destinatario_uf,
        destinatario_cep: cteData.destinatario_cep,
        tomador_tipo: cteData.tipo_tomador || "0",
        tomador_cnpj: cteData.tomador_cnpj,
        tomador_nome: cteData.tomador_razao,
        valor_total: cteData.valor_total,
        valor_frete: cteData.valor_total,
        valor_mercadoria: cteData.valor_carga,
        peso_bruto: cteData.peso_bruto,
        quantidade_volumes: cteData.quantidade_volumes || 1,
        produto_predominante: cteData.produto_predominante || "PRODUTOS QUIMICOS",
        placa_veiculo: cteData.placa_veiculo,
        uf_veiculo: cteData.uf_veiculo,
        rntrc: emitenteRntrc,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Erro ao salvar CT-e:', dbError);
      throw dbError;
    }

    return new Response(JSON.stringify({
      success: true,
      cte_id: cteRecord.id,
      numero: cteData.numero,
      chave: responseData.chave,
      protocolo: responseData.protocolo,
      pdf_url: responseData.pdf,
      xml_url: responseData.xml,
      status: responseData.status,
    }), { headers: { ...getCors(origin), 'Content-Type': 'application/json' } });

    // Criar viagem TMS e notificar motorista (opcional)
    try {
      if ((cteData as any).driver_id) {
        const tripPayload: any = {
          vehicle_plate: (cteData as any).vehicle_plate || null,
          driver_id: (cteData as any).driver_id,
          cte_id: cteRecord.id,
          status: 'planned',
          created_at: new Date().toISOString()
        };
        const { data: trip } = await supabase.from('trips').insert(tripPayload).select('*').maybeSingle();
        await supabase.from('notifications').insert({ user_id: (cteData as any).driver_id, title: 'Nova viagem', message: 'Uma viagem foi criada a partir do CT-e', type: 'info', module: 'operations', read: false });
        await logFunction(supabase, crypto.randomUUID(), 'emitir-cte', 'info', 'trip created from cte', { trip_id: trip?.id, driver_id: (cteData as any).driver_id });
      }
    } catch (_) {}
  } catch (error) {
    console.error('Erro ao emitir CT-e:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }), { status: 500, headers: { ...getCors(origin), 'Content-Type': 'application/json' } });
  }
});
