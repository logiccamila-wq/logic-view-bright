import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔄 Iniciando importação de clientes dos CTEs...');

    // Buscar tomadores únicos dos CTEs
    const { data: ctes, error: cteError } = await supabase
      .from('cte')
      .select('tomador_cnpj, tomador_nome, destinatario_cnpj, destinatario_nome, destinatario_cidade, destinatario_uf, destinatario_cep, destinatario_endereco')
      .not('tomador_cnpj', 'is', null);

    if (cteError) throw cteError;

    // Agrupar por CNPJ (tanto tomador quanto destinatário)
    const clientsMap = new Map();

    ctes?.forEach((cte) => {
      // Adicionar tomador
      if (cte.tomador_cnpj && !clientsMap.has(cte.tomador_cnpj)) {
        clientsMap.set(cte.tomador_cnpj, {
          cnpj: cte.tomador_cnpj,
          razao_social: cte.tomador_nome || `Cliente ${cte.tomador_cnpj}`,
          nome_fantasia: cte.tomador_nome,
          status: 'ativo',
        });
      }

      // Adicionar destinatário
      if (cte.destinatario_cnpj && !clientsMap.has(cte.destinatario_cnpj)) {
        clientsMap.set(cte.destinatario_cnpj, {
          cnpj: cte.destinatario_cnpj,
          razao_social: cte.destinatario_nome || `Cliente ${cte.destinatario_cnpj}`,
          nome_fantasia: cte.destinatario_nome,
          cidade: cte.destinatario_cidade,
          uf: cte.destinatario_uf,
          cep: cte.destinatario_cep,
          endereco: cte.destinatario_endereco,
          status: 'ativo',
        });
      }
    });

    console.log(`📊 ${clientsMap.size} clientes únicos encontrados nos CTEs`);

    // Verificar quais clientes já existem
    const { data: existingClients } = await supabase
      .from('clients')
      .select('cnpj');

    const existingCnpjs = new Set(existingClients?.map(c => c.cnpj) || []);

    // Filtrar apenas novos clientes
    const newClients = Array.from(clientsMap.values()).filter(
      client => !existingCnpjs.has(client.cnpj)
    );

    console.log(`✨ ${newClients.length} novos clientes para importar`);

    if (newClients.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Nenhum cliente novo para importar',
          imported: 0,
          total: clientsMap.size
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir novos clientes
    const { data: insertedClients, error: insertError } = await supabase
      .from('clients')
      .insert(newClients)
      .select();

    if (insertError) throw insertError;

    console.log(`✅ ${insertedClients?.length || 0} clientes importados com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${insertedClients?.length || 0} clientes importados dos CTEs`,
        imported: insertedClients?.length || 0,
        total: clientsMap.size,
        clients: insertedClients
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro na importação:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
