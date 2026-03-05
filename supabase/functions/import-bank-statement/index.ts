import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { importId, accountId, formato, fileContent } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let transacoes: any[] = [];

    // Parser simplificado (exemplo básico)
    if (formato === 'CSV') {
      const lines = fileContent.split('\n').slice(1);
      transacoes = lines.map((line: string) => {
        const [data, descricao, valor, tipo] = line.split(',');
        return {
          bank_account_id: accountId,
          data_transacao: new Date(data).toISOString(),
          descricao: descricao?.trim(),
          valor: parseFloat(valor),
          tipo_transacao: tipo?.trim().toLowerCase() === 'credito' ? 'credito' : 'debito',
          importacao_id: importId,
        };
      }).filter((t: any) => t.descricao && t.valor);
    }

    // Inserir transações
    const { error: insertError } = await supabase
      .from('bank_transactions')
      .insert(transacoes);

    if (insertError) throw insertError;

    // Atualizar importação
    await supabase
      .from('bank_imports')
      .update({
        status: 'concluido',
        total_transacoes: transacoes.length,
        total_conciliadas: 0,
      })
      .eq('id', importId);

    return new Response(
      JSON.stringify({ success: true, transacoesImportadas: transacoes.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});