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

    const { mdfe_id, chave_acesso, uf_encerramento, municipio_encerramento, data_encerramento } = await req.json();

    const brasilnfeToken = Deno.env.get('BRASILNFE_API_TOKEN');
    const ambiente = Deno.env.get('BRASILNFE_AMBIENTE') || 'homologacao';

    // Buscar MDF-e no banco
    const { data: mdfe, error: mdfeError } = await supabase
      .from('mdfe')
      .select('*')
      .eq('id', mdfe_id)
      .single();

    if (mdfeError || !mdfe) {
      throw new Error('MDF-e não encontrado');
    }

    // Enviar encerramento para Brasil NFe
    const payload = {
      chave: chave_acesso || mdfe.chave_acesso,
      uf: uf_encerramento,
      municipio: municipio_encerramento,
      data_encerramento: data_encerramento || new Date().toISOString(),
    };

    console.log('Encerrando MDF-e:', JSON.stringify(payload, null, 2));

    const brasilnfeResponse = await fetch(
      `https://api.brasilnfe.com.br/mdfe/${ambiente === 'producao' ? 'producao' : 'homologacao'}/encerrar`,
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
    console.log('Resposta encerramento MDF-e:', JSON.stringify(responseData, null, 2));

    if (!brasilnfeResponse.ok) {
      throw new Error(`Brasil NFe error: ${JSON.stringify(responseData)}`);
    }

    // Atualizar no banco
    const { error: updateError } = await supabase
      .from('mdfe')
      .update({
        status: 'encerrado',
        uf_encerramento,
        municipio_encerramento,
        data_encerramento: data_encerramento || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', mdfe_id);

    if (updateError) {
      console.error('Erro ao atualizar MDF-e:', updateError);
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        mdfe_id,
        status: 'encerrado',
        protocolo: responseData.protocolo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao encerrar MDF-e:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
