import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CTEData {
  cte_chave: string;
  numero_cte: string;
  data_emissao: string;
  cliente_cnpj: string;
  cliente_nome: string;
  cliente_uf: string;
  destinatario_cnpj?: string;
  destinatario_nome?: string;
  destinatario_uf?: string;
  valor_frete: number;
  valor_mercadoria: number;
  valor_icms: number;
  peso_kg: number;
  volumes: number;
  origem_uf: string;
  destino_uf: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error('Não autorizado')
    }

    const { xml_content } = await req.json()

    if (!xml_content) {
      throw new Error('XML content is required')
    }

    console.log('Processando XML de CT-e...')

    // Parse XML (simplified - in production use a proper XML parser)
    const cteData = parseXML(xml_content)

    // Insert into database
    const { data, error: insertError } = await supabaseClient
      .from('revenue_records')
      .insert([{
        ...cteData,
        created_by: user.id,
        status: 'ativo'
      }])
      .select()

    if (insertError) {
      console.error('Erro ao inserir CT-e:', insertError)
      throw insertError
    }

    console.log('CT-e importado com sucesso:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Erro na importação:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function parseXML(xmlContent: string): CTEData {
  // Simplified XML parsing - extract key values using regex
  // In production, use a proper XML parser library
  
  const extractValue = (tag: string): string => {
    const regex = new RegExp(`<${tag}>(.*?)</${tag}>`, 's')
    const match = xmlContent.match(regex)
    return match ? match[1].trim() : ''
  }

  const extractNumeric = (tag: string): number => {
    const value = extractValue(tag)
    return value ? parseFloat(value) : 0
  }

  // Extract remetente (sender - who is the client/tomador)
  const remCNPJ = extractValue('CNPJ')
  const remNome = extractValue('xNome')
  const remUF = extractValue('UF')

  // Extract destinatário
  const destCNPJ = xmlContent.match(/<dest>.*?<CNPJ>(.*?)<\/CNPJ>/s)?.[1] || ''
  const destNome = xmlContent.match(/<dest>.*?<xNome>(.*?)<\/xNome>/s)?.[1] || ''
  const destUF = xmlContent.match(/<enderDest>.*?<UF>(.*?)<\/UF>/s)?.[1] || ''

  // Extract financial values
  const valorFrete = extractNumeric('vTPrest')
  const valorMercadoria = extractNumeric('vCarga')
  const valorICMS = extractNumeric('vICMS')

  // Extract cargo info
  const pesoKg = extractNumeric('qCarga')
  const volumes = 1 // Default, could be extracted from infQ

  // Extract dates and keys
  const chave = extractValue('chCTe')
  const dhEmi = extractValue('dhEmi')
  const numeroCTe = chave.slice(-14) // Last 14 digits typically represent the CT-e number

  return {
    cte_chave: chave,
    numero_cte: numeroCTe,
    data_emissao: new Date(dhEmi).toISOString(),
    cliente_cnpj: remCNPJ,
    cliente_nome: remNome,
    cliente_uf: remUF,
    destinatario_cnpj: destCNPJ,
    destinatario_nome: destNome,
    destinatario_uf: destUF,
    valor_frete: valorFrete,
    valor_mercadoria: valorMercadoria,
    valor_icms: valorICMS,
    peso_kg: pesoKg,
    volumes: volumes,
    origem_uf: remUF,
    destino_uf: destUF
  }
}
