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
  placa_carreta?: string;
  valor_pedagio?: number;
  peso_cubado?: number;
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

    const { xml_files } = await req.json()

    if (!xml_files || !Array.isArray(xml_files) || xml_files.length === 0) {
      throw new Error('Array de XMLs é obrigatório')
    }

    console.log(`Processando ${xml_files.length} CT-es...`)

    const results = {
      success: [] as string[],
      errors: [] as { numero_cte: string, error: string }[],
      clients_created: 0,
      ctes_created: 0
    }

    for (const xml_content of xml_files) {
      try {
        const cteData = parseXML(xml_content)
        
        // Validar se a placa existe no sistema
        const { data: vehicleExists } = await supabaseClient
          .from('vehicles')
          .select('placa')
          .eq('placa', cteData.placa_veiculo.toUpperCase())
          .maybeSingle()

        if (!vehicleExists) {
          results.errors.push({
            numero_cte: cteData.numero_cte,
            error: `Placa ${cteData.placa_veiculo} não encontrada no sistema`
          })
          continue
        }

        // Verificar se cliente existe, senão criar
        const { data: existingClient } = await supabaseClient
          .from('clients')
          .select('cnpj')
          .eq('cnpj', cteData.tomador_cnpj)
          .maybeSingle()

        if (!existingClient) {
          console.log('Cliente não encontrado, criando:', cteData.tomador_nome)
          await supabaseClient
            .from('clients')
            .insert({
              cnpj: cteData.tomador_cnpj,
              razao_social: cteData.tomador_nome,
              nome_fantasia: cteData.tomador_nome,
              created_by: user.id
            })
          results.clients_created++
        }

        // Verificar se CT-e já existe
        const { data: existingCte } = await supabaseClient
          .from('cte')
          .select('numero_cte')
          .eq('numero_cte', cteData.numero_cte)
          .maybeSingle()

        if (existingCte) {
          results.errors.push({
            numero_cte: cteData.numero_cte,
            error: 'CT-e já existe no sistema'
          })
          continue
        }

        // Inserir CT-e com status autorizado para trigger criar conta a receber
        const { error: insertError } = await supabaseClient
          .from('cte')
          .insert([{
            numero_cte: cteData.numero_cte,
            serie: '1',
            tipo_cte: '0',
            tipo_servico: '0',
            chave_acesso: cteData.chave_acesso,
            data_emissao: cteData.data_emissao,
            data_vencimento: cteData.data_vencimento,
            status: 'autorizado', // Status autorizado para trigger criar conta a receber
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
            peso_cubado: cteData.peso_cubado || 0,
            quantidade_volumes: cteData.quantidade_volumes,
            valor_mercadoria: cteData.valor_mercadoria,
            valor_frete: cteData.valor_frete,
            valor_pedagio: cteData.valor_pedagio || 0,
            valor_total: cteData.valor_total,
            placa_veiculo: cteData.placa_veiculo.toUpperCase(),
            placa_carreta: cteData.placa_carreta?.toUpperCase() || null,
            uf_veiculo: cteData.uf_veiculo.toUpperCase(),
            tipo_frete: cteData.tipo_frete,
            modal: cteData.modal,
            created_by: user.id
          }])

        if (insertError) {
          console.error('Erro ao inserir CT-e:', insertError)
          results.errors.push({
            numero_cte: cteData.numero_cte,
            error: insertError.message
          })
          continue
        }

        results.success.push(cteData.numero_cte)
        results.ctes_created++

      } catch (error) {
        console.error('Erro ao processar XML:', error)
        results.errors.push({
          numero_cte: 'desconhecido',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    // Recalcular indicadores financeiros após importação
    console.log('Recalculando indicadores financeiros...')
    await supabaseClient.rpc('calculate_client_financial_analysis')

    console.log('Importação concluída:', results)

    return new Response(
      JSON.stringify(results),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      },
    )

  } catch (error) {
    console.error('Erro fatal na importação:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      },
    )
  }
})

function parseXML(xmlContent: string): CTEDataFromXML {
  const extractValue = (xml: string, tag: string): string => {
    const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  };

  const extractNumeric = (xml: string, tag: string): number => {
    const value = extractValue(xml, tag);
    return value ? parseFloat(value.replace(',', '.')) : 0;
  };

  // Extrair chave de acesso
  const chaveAcesso = extractValue(xmlContent, 'chCTe');
  
  // Dados de identificação
  const numeroCte = extractValue(xmlContent, 'nCT');
  const dataEmissao = extractValue(xmlContent, 'dhEmi');
  
  // Remetente
  const remetente = {
    nome: extractValue(xmlContent, 'xNome'),
    cnpj: extractValue(xmlContent.split('</rem>')[0], 'CNPJ'),
    endereco: extractValue(xmlContent, 'xLgr'),
    cidade: extractValue(xmlContent.split('</rem>')[0], 'xMun'),
    uf: extractValue(xmlContent.split('</rem>')[0], 'UF'),
    cep: extractValue(xmlContent.split('</rem>')[0], 'CEP')
  };

  // Destinatário
  const destinatarioSection = xmlContent.split('<dest>')[1]?.split('</dest>')[0] || '';
  const destinatario = {
    nome: extractValue(destinatarioSection, 'xNome'),
    cnpj: extractValue(destinatarioSection, 'CNPJ') || extractValue(destinatarioSection, 'CPF'),
    endereco: extractValue(destinatarioSection, 'xLgr'),
    cidade: extractValue(destinatarioSection, 'xMun'),
    uf: extractValue(destinatarioSection, 'UF'),
    cep: extractValue(destinatarioSection, 'CEP')
  };

  // Tomador
  const indicadorTomador = extractValue(xmlContent, 'toma3')?.charAt(0) || 
                          extractValue(xmlContent, 'toma4')?.charAt(0) || '0';
  
  let tomador = { tipo: '', nome: '', cnpj: '' };
  
  if (indicadorTomador === '0') {
    tomador = { tipo: 'remetente', nome: remetente.nome, cnpj: remetente.cnpj };
  } else if (indicadorTomador === '1') {
    tomador = { tipo: 'destinatario', nome: destinatario.nome, cnpj: destinatario.cnpj };
  } else {
    const tomadorSection = xmlContent.split('<toma4>')[1]?.split('</toma4>')[0] || '';
    tomador = {
      tipo: 'outros',
      nome: extractValue(tomadorSection, 'xNome'),
      cnpj: extractValue(tomadorSection, 'CNPJ')
    };
  }

  // Carga
  const produtoPredominante = extractValue(xmlContent, 'xOutCat') || extractValue(xmlContent, 'proPred') || 'Diversos';
  const pesoBruto = extractNumeric(xmlContent, 'qCarga');
  const volumes = parseInt(extractValue(xmlContent, 'qCarga')) || 1;

  // Valores
  const valorMercadoria = extractNumeric(xmlContent, 'vMerc');
  const valorFrete = extractNumeric(xmlContent, 'vTPrest');
  const valorPedagio = extractNumeric(xmlContent, 'vPed');
  const valorTotal = extractNumeric(xmlContent, 'vRec');

  // Transporte
  const placaVeiculo = extractValue(xmlContent, 'placa') || '';
  const ufVeiculo = extractValue(xmlContent.split('<veicTracao>')[1]?.split('</veicTracao>')[0] || '', 'UF') || 'PR';
  
  // Placa carreta (reboque)
  const placaCarreta = extractValue(xmlContent.split('<veicReboque>')[1]?.split('</veicReboque>')[0] || '', 'placa');

  // Modal e tipo de frete
  const modal = extractValue(xmlContent, 'modal') === '01' ? 'rodoviario' : 'aereo';
  const tipoFrete = extractValue(xmlContent, 'tpServ') === '0' ? 'cif' : 'fof';

  // Data de vencimento (30 dias após emissão por padrão)
  const dataEmissaoDate = new Date(dataEmissao);
  dataEmissaoDate.setDate(dataEmissaoDate.getDate() + 30);
  const dataVencimento = dataEmissaoDate.toISOString();

  return {
    numero_cte: numeroCte,
    chave_acesso: chaveAcesso,
    data_emissao: dataEmissao,
    data_vencimento: dataVencimento,
    remetente_nome: remetente.nome,
    remetente_cnpj: remetente.cnpj,
    remetente_endereco: remetente.endereco,
    remetente_cidade: remetente.cidade,
    remetente_uf: remetente.uf,
    remetente_cep: remetente.cep,
    destinatario_nome: destinatario.nome,
    destinatario_cnpj: destinatario.cnpj,
    destinatario_endereco: destinatario.endereco,
    destinatario_cidade: destinatario.cidade,
    destinatario_uf: destinatario.uf,
    destinatario_cep: destinatario.cep,
    tomador_tipo: tomador.tipo,
    tomador_nome: tomador.nome,
    tomador_cnpj: tomador.cnpj,
    produto_predominante: produtoPredominante,
    peso_bruto: pesoBruto,
    peso_cubado: pesoBruto * 1.1,
    quantidade_volumes: volumes,
    valor_mercadoria: valorMercadoria,
    valor_frete: valorFrete,
    valor_pedagio: valorPedagio,
    valor_total: valorTotal,
    placa_veiculo: placaVeiculo,
    placa_carreta: placaCarreta || undefined,
    uf_veiculo: ufVeiculo,
    tipo_frete: tipoFrete,
    modal: modal
  };
}
