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
    
    console.log('CT-e parseado:', { numero: cteData.numero_cte, placa: cteData.placa_veiculo })

    // Validar se a placa existe no sistema (tenta variações)
    const originalPlate = (cteData.placa_veiculo || '').toUpperCase()
    const sanitizedPlate = originalPlate.replace(/[^A-Z0-9]/g, '')
    const hyphenatedPlate = sanitizedPlate.length > 3 ? `${sanitizedPlate.slice(0,3)}-${sanitizedPlate.slice(3)}` : sanitizedPlate

    let vehicleExists = null as any
    if (originalPlate) {
      const r1 = await supabaseClient.from('vehicles').select('placa').eq('placa', originalPlate).maybeSingle()
      vehicleExists = r1.data || null
    }
    if (!vehicleExists && sanitizedPlate) {
      const r2 = await supabaseClient.from('vehicles').select('placa').eq('placa', sanitizedPlate).maybeSingle()
      vehicleExists = r2.data || null
    }
    if (!vehicleExists && hyphenatedPlate) {
      const r3 = await supabaseClient.from('vehicles').select('placa').eq('placa', hyphenatedPlate).maybeSingle()
      vehicleExists = r3.data || null
    }

    if (!vehicleExists) {
      console.error('Placa não encontrada. Tentativas:', { originalPlate, sanitizedPlate, hyphenatedPlate })
      throw new Error(`Placa ${cteData.placa_veiculo || '(vazia)'} não encontrada no sistema. Importe os veículos primeiro.`)
    }

    console.log('Placa validada:', vehicleExists.placa)

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

    // Inserir Conta a Receber automaticamente
    try {
      console.log('Gerando conta a receber...');
      // Calcular vencimento se não vier no XML (padrão 30 dias)
      let vencimentoCR = cteData.data_vencimento;
      if (!vencimentoCR) {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        vencimentoCR = d.toISOString();
      }

      const { error: crError } = await supabaseClient
        .from('contas_receber')
        .insert({
          descricao: `CT-e ${cteData.numero_cte} - ${cteData.produto_predominante}`,
          cliente: cteData.tomador_nome,
          valor: cteData.valor_total,
          data_vencimento: vencimentoCR,
          status: 'pendente', 
          observacoes: `Importado via XML. Origem: ${cteData.remetente_cidade}/${cteData.remetente_uf} -> Destino: ${cteData.destinatario_cidade}/${cteData.destinatario_uf}`,
          cte_id: cteInserted[0].id
        });
        
      if (crError) {
         console.error('Erro ao gerar conta a receber:', crError);
      } else {
         console.log('Conta a receber gerada com sucesso');
      }
    } catch (crErr) {
      console.error('Exceção ao gerar financeiro:', crErr);
    }

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
  // Parser robusto que trata namespaces como cte:placa, cte:nCT, etc.
  const extractValueNs = (xml: string, tag: string): string => {
    const regex = new RegExp(`<(?:[\\w]+:)?${tag}>([^<]*)<\\/(?:[\\w]+:)?${tag}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1].trim() : ''
  }
  
  const extractSectionNs = (xml: string, tag: string): string => {
    const regex = new RegExp(`<(?:[\\w]+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:[\\w]+:)?${tag}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1] : ''
  }
  
  const extractNumeric = (xml: string, tag: string): number => {
    const value = extractValueNs(xml, tag)
    return value ? parseFloat(value.replace(',', '.')) : 0
  }
  
  const sanitizePlate = (p: string) => p ? p.toUpperCase().replace(/[^A-Z0-9]/g, '') : ''

  console.log('Parseando XML... (primeiros 500 chars):', xmlContent.substring(0, 500))

  // Identificação
  const chaveAcesso = extractValueNs(xmlContent, 'chCTe')
  const numeroCte = extractValueNs(xmlContent, 'nCT') || extractValueNs(xmlContent, 'nCte') || '0'
  const dataEmissao = extractValueNs(xmlContent, 'dhEmi') || extractValueNs(xmlContent, 'dEmi') || new Date().toISOString()

  // Remetente
  const remSection = extractSectionNs(xmlContent, 'rem')
  const remetente = {
    nome: extractValueNs(remSection || xmlContent, 'xNome'),
    cnpj: extractValueNs(remSection || xmlContent, 'CNPJ'),
    endereco: extractValueNs(remSection || xmlContent, 'xLgr'),
    cidade: extractValueNs(remSection || xmlContent, 'xMun'),
    uf: extractValueNs(remSection || xmlContent, 'UF'),
    cep: extractValueNs(remSection || xmlContent, 'CEP'),
  }

  // Destinatário
  const destSection = extractSectionNs(xmlContent, 'dest')
  const destinatario = {
    nome: extractValueNs(destSection, 'xNome'),
    cnpj: extractValueNs(destSection, 'CNPJ') || extractValueNs(destSection, 'CPF'),
    endereco: extractValueNs(destSection, 'xLgr'),
    cidade: extractValueNs(destSection, 'xMun'),
    uf: extractValueNs(destSection, 'UF'),
    cep: extractValueNs(destSection, 'CEP'),
  }

  // Tomador
  const indicadorTomador = (extractValueNs(xmlContent, 'toma3') || extractValueNs(xmlContent, 'toma4') || '0').charAt(0)
  let tomador = { tipo: 'remetente', nome: remetente.nome, cnpj: remetente.cnpj }
  if (indicadorTomador === '1') tomador = { tipo: 'destinatario', nome: destinatario.nome, cnpj: destinatario.cnpj }
  if (indicadorTomador !== '0' && indicadorTomador !== '1') {
    const toma4 = extractSectionNs(xmlContent, 'toma4')
    tomador = {
      tipo: 'outros',
      nome: extractValueNs(toma4, 'xNome') || remetente.nome,
      cnpj: extractValueNs(toma4, 'CNPJ') || remetente.cnpj,
    }
  }

  // Carga
  const produtoPredominante = extractValueNs(xmlContent, 'xOutCat') || extractValueNs(xmlContent, 'proPred') || 'Diversos'
  const pesoBruto = extractNumeric(xmlContent, 'qCarga') || extractNumeric(xmlContent, 'pesoBruto')
  const volumes = parseInt(extractValueNs(xmlContent, 'qVol') || extractValueNs(xmlContent, 'qCarga') || '1')

  // Valores
  const valorMercadoria = extractNumeric(xmlContent, 'vMerc') || extractNumeric(xmlContent, 'vCarga')
  const valorFrete = extractNumeric(xmlContent, 'vTPrest')
  const valorTotal = extractNumeric(xmlContent, 'vRec') || valorFrete

  // Transporte (trator e reboque) - CRÍTICO para extrair placa
  const veicTracao = extractSectionNs(xmlContent, 'veicTracao')
  const veicReboque = extractSectionNs(xmlContent, 'veicReboque')
  
  let placaVeiculo = sanitizePlate(extractValueNs(veicTracao, 'placa') || extractValueNs(xmlContent, 'placa'))
  const ufVeiculo = extractValueNs(veicTracao, 'UF') || extractValueNs(xmlContent, 'UF') || 'PR'
  const placaCarreta = sanitizePlate(extractValueNs(veicReboque, 'placa'))

  console.log('Placas extraídas:', { placaVeiculo, placaCarreta, veicTracao: !!veicTracao, veicReboque: !!veicReboque })

  // Se não tem placa do cavalo mas tem da carreta, usa a carreta
  if (!placaVeiculo && placaCarreta) {
    placaVeiculo = placaCarreta
  }

  // Modal e frete
  const modal = (extractValueNs(xmlContent, 'modal') === '01') ? 'rodoviario' : 'aereo'
  const tipoFrete = (extractValueNs(xmlContent, 'tpServ') === '0') ? 'cif' : 'fob'

  // Vencimento padrão 30 dias
  const dataEmissaoDate = new Date(dataEmissao)
  dataEmissaoDate.setDate(dataEmissaoDate.getDate() + 30)
  const dataVencimento = dataEmissaoDate.toISOString()

  return {
    numero_cte: numeroCte,
    chave_acesso: chaveAcesso,
    data_emissao: dataEmissao,
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
