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

    const { chave_acesso } = await req.json();

    const brasilnfeToken = Deno.env.get('BRASILNFE_API_TOKEN');
    const ambiente = Deno.env.get('BRASILNFE_AMBIENTE') || 'homologacao';

    console.log('Consultando status CT-e:', chave_acesso);

    const brasilnfeResponse = await fetch(
      `https://api.brasilnfe.com.br/cte/${ambiente === 'producao' ? 'producao' : 'homologacao'}/consultar`,
      {
        method: 'POST',
        headers: {
          'Token': brasilnfeToken!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chave: chave_acesso }),
      }
    );

    const responseData = await brasilnfeResponse.json();
    console.log('Status CT-e:', JSON.stringify(responseData, null, 2));

    if (!brasilnfeResponse.ok) {
      throw new Error(`Brasil NFe error: ${JSON.stringify(responseData)}`);
    }

    // Atualizar status no banco se necessário
    if (responseData.status) {
      const { error: updateError } = await supabase
        .from('cte')
        .update({
          status: responseData.status,
          protocolo_autorizacao: responseData.protocolo || null,
          data_autorizacao: responseData.data_autorizacao || null,
          updated_at: new Date().toISOString(),
        })
        .eq('chave_acesso', chave_acesso);

      if (updateError) {
        console.error('Erro ao atualizar status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        chave: chave_acesso,
        status: responseData.status,
        protocolo: responseData.protocolo,
        data_autorizacao: responseData.data_autorizacao,
        situacao: responseData.situacao,
        mensagem: responseData.mensagem,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro ao consultar status:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
