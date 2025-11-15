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
      vehicles_created: 0,
      ctes_created: 0
    }

    for (const xml_content of xml_files) {
      try {
        const cteData = parseXML(xml_content)
        
        // Auto-cadastrar veículo se não existir (com validação de placa BR)
        let finalPlate = (cteData.placa_veiculo || '').toUpperCase();
        
        // Validar formato de placa brasileira (ABC1234 ou ABC1D23)
        const isValidBrazilianPlate = /^[A-Z]{3}[0-9]{4}$|^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(finalPlate);
        
        if (finalPlate && isValidBrazilianPlate) {
          // Verificar se veículo existe
          const { data: vehicleExists } = await supabaseClient
            .from('vehicles')
            .select('placa')
            .eq('placa', finalPlate)
            .maybeSingle();

          if (!vehicleExists) {
            // Auto-cadastrar veículo
            console.log(`Auto-cadastrando veículo: ${finalPlate}`);
            const { error: vehicleError } = await supabaseClient
              .from('vehicles')
              .insert({
                placa: finalPlate,
                tipo: 'caminhao',
                status: 'ativo',
                modelo: 'Importado via CT-e',
                ano: new Date().getFullYear()
              });

            if (vehicleError) {
              console.error('Erro ao auto-cadastrar veículo:', vehicleError);
              results.errors.push({
                numero_cte: cteData.numero_cte,
                error: `Erro ao auto-cadastrar placa ${finalPlate}: ${vehicleError.message}`
              });
              continue;
            }
            results.vehicles_created++;
          }
        } else if (!isValidBrazilianPlate && finalPlate) {
          console.warn(`Placa inválida detectada: ${finalPlate} - CT-e ${cteData.numero_cte}`);
          // Define placa padrão para permitir importação
          finalPlate = 'SEM-PLACA';
          
          // Cria veículo genérico se não existir
          const { data: genericVehicle } = await supabaseClient
            .from('vehicles')
            .select('placa')
            .eq('placa', 'SEM-PLACA')
            .maybeSingle();
            
          if (!genericVehicle) {
            await supabaseClient
              .from('vehicles')
              .insert({
                placa: 'SEM-PLACA',
                tipo: 'caminhao',
                status: 'ativo',
                modelo: 'Veículo não identificado',
                ano: new Date().getFullYear()
              });
            results.vehicles_created++;
          }
        }

        // Se não foi possível extrair placa, usar 'SEM-PLACA' como padrão
        if (!finalPlate) {
          finalPlate = 'SEM-PLACA';
          const { data: genericVehicle2 } = await supabaseClient
            .from('vehicles')
            .select('placa')
            .eq('placa', 'SEM-PLACA')
            .maybeSingle();
          if (!genericVehicle2) {
            await supabaseClient
              .from('vehicles')
              .insert({
                placa: 'SEM-PLACA',
                tipo: 'caminhao',
                status: 'ativo',
                modelo: 'Veículo não identificado',
                ano: new Date().getFullYear()
              });
            results.vehicles_created++;
          }
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
            tipo_cte: 'normal',
            tipo_servico: 'normal',
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
            placa_veiculo: finalPlate,
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
  // Helpers robustos para XML com namespaces (ex.: <cte:placa>)
  const extractValueNs = (xml: string, tag: string): string => {
    const regex = new RegExp(`<(?:[\\w]+:)?${tag}>([^<]*)<\\/(?:[\\w]+:)?${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : '';
  };
  const extractSectionNs = (xml: string, tag: string): string => {
    const regex = new RegExp(`<(?:[\\w]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[\\w]+:)?${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
  };
  const extractNumeric = (xml: string, tag: string): number => {
    const value = extractValueNs(xml, tag);
    return value ? parseFloat(value.replace(',', '.')) : 0;
  };
  const sanitizePlate = (p: string) => p ? p.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';

  // Identificação
  const chaveAcesso = extractValueNs(xmlContent, 'chCTe');
  const numeroCte = extractValueNs(xmlContent, 'nCT') || extractValueNs(xmlContent, 'nCte') || '0';
  const dataEmissao = extractValueNs(xmlContent, 'dhEmi') || extractValueNs(xmlContent, 'dEmi') || new Date().toISOString();

  // Remetente
  const remSection = extractSectionNs(xmlContent, 'rem');
  const remetente = {
    nome: extractValueNs(remSection || xmlContent, 'xNome'),
    cnpj: extractValueNs(remSection || xmlContent, 'CNPJ'),
    endereco: extractValueNs(remSection || xmlContent, 'xLgr'),
    cidade: extractValueNs(remSection || xmlContent, 'xMun'),
    uf: extractValueNs(remSection || xmlContent, 'UF'),
    cep: extractValueNs(remSection || xmlContent, 'CEP'),
  };

  // Destinatário
  const destSection = extractSectionNs(xmlContent, 'dest');
  const destinatario = {
    nome: extractValueNs(destSection, 'xNome'),
    cnpj: extractValueNs(destSection, 'CNPJ') || extractValueNs(destSection, 'CPF'),
    endereco: extractValueNs(destSection, 'xLgr'),
    cidade: extractValueNs(destSection, 'xMun'),
    uf: extractValueNs(destSection, 'UF'),
    cep: extractValueNs(destSection, 'CEP'),
  };

  // Tomador
  const indicadorTomador = (extractValueNs(xmlContent, 'toma3') || extractValueNs(xmlContent, 'toma4') || '0').charAt(0);
  let tomador = { tipo: 'remetente', nome: remetente.nome, cnpj: remetente.cnpj };
  if (indicadorTomador === '1') tomador = { tipo: 'destinatario', nome: destinatario.nome, cnpj: destinatario.cnpj };
  if (indicadorTomador !== '0' && indicadorTomador !== '1') {
    const toma4 = extractSectionNs(xmlContent, 'toma4');
    tomador = {
      tipo: 'outros',
      nome: extractValueNs(toma4, 'xNome') || remetente.nome,
      cnpj: extractValueNs(toma4, 'CNPJ') || remetente.cnpj,
    };
  }

  // Carga
  const produtoPredominante = extractValueNs(xmlContent, 'xOutCat') || extractValueNs(xmlContent, 'proPred') || 'Diversos';
  const pesoBruto = extractNumeric(xmlContent, 'qCarga') || extractNumeric(xmlContent, 'pesoBruto');
  const volumes = parseInt(extractValueNs(xmlContent, 'qVol') || extractValueNs(xmlContent, 'qCarga') || '1');

  // Valores
  const valorMercadoria = extractNumeric(xmlContent, 'vMerc');
  const valorFrete = extractNumeric(xmlContent, 'vTPrest');
  const valorPedagio = extractNumeric(xmlContent, 'vPed');
  const valorTotal = extractNumeric(xmlContent, 'vRec') || valorFrete;

  // Transporte (trator e reboque)
  const veicTracao = extractSectionNs(xmlContent, 'veicTracao');
  const veicReboque = extractSectionNs(xmlContent, 'veicReboque');
  let placaVeiculo = sanitizePlate(
    extractValueNs(veicTracao, 'placa') ||
    extractValueNs(xmlContent, 'placa')
  );
  let ufVeiculo = extractValueNs(veicTracao, 'UF') || extractValueNs(xmlContent, 'UF') || 'PR';
  const placaCarreta = sanitizePlate(extractValueNs(veicReboque, 'placa')) || undefined;

  // Fallbacks adicionais: CT-e pode trazer placa dentro de infModal/rodo ou com outras tags
  const infModal = extractSectionNs(xmlContent, 'infModal');
  const rodo = extractSectionNs(infModal || xmlContent, 'rodo');
  if (!placaVeiculo) {
    placaVeiculo = sanitizePlate(
      extractValueNs(rodo, 'placa') ||
      extractValueNs(rodo, 'placaTracao') ||
      extractValueNs(xmlContent, 'placaVeiculo') ||
      extractValueNs(xmlContent, 'placa')
    );
  }

  // Regex de placa BR com word boundaries para evitar pegar números de CT-e
  if (!placaVeiculo) {
    const upper = xmlContent.toUpperCase();
    // Buscar dentro de tags específicas de placa para evitar falsos positivos
    const veicTracaoMatch = upper.match(/<(?:\w+:)?VEICTRACAO[^>]*>[\s\S]*?<(?:\w+:)?PLACA>([^<]+)<\/(?:\w+:)?PLACA>[\s\S]*?<\/(?:\w+:)?VEICTRACAO>/i);
    if (veicTracaoMatch) {
      placaVeiculo = sanitizePlate(veicTracaoMatch[1]);
    } else {
      // Fallback: buscar qualquer tag placa, mas validar formato rigorosamente
      const anyPlateMatch = upper.match(/<(?:\w+:)?PLACA>([A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})<\/(?:\w+:)?PLACA>/i);
      if (anyPlateMatch) {
        placaVeiculo = sanitizePlate(anyPlateMatch[1]);
      }
    }
  }

  console.log('DEBUG placa extraída (batch):', { placaVeiculo, placaCarreta, hasTracao: !!veicTracao, hasReboque: !!veicReboque });

  // Modal e frete
  const modal = (extractValueNs(xmlContent, 'modal') === '01') ? 'rodoviario' : 'aereo';
  const tipoFrete = (extractValueNs(xmlContent, 'tpServ') === '0') ? 'cif' : 'fob';

  // Vencimento padrão 30 dias
  const dataEmissaoDate = new Date(dataEmissao);
  dataEmissaoDate.setDate(dataEmissaoDate.getDate() + 30);
  const dataVencimento = dataEmissaoDate.toISOString();

  if (!placaVeiculo && placaCarreta) {
    // fallback: usar placa da carreta se o XML não trouxe tração
    placaVeiculo = placaCarreta;
  }

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
    peso_cubado: pesoBruto ? pesoBruto * 1.1 : 0,
    quantidade_volumes: volumes,
    valor_mercadoria: valorMercadoria,
    valor_frete: valorFrete,
    valor_pedagio: valorPedagio,
    valor_total: valorTotal,
    placa_veiculo: placaVeiculo,
    placa_carreta: placaCarreta,
    uf_veiculo: ufVeiculo,
    tipo_frete: tipoFrete,
    modal: modal
  };
}
