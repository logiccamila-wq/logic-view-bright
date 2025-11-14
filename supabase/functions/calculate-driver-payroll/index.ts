import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { mes, ano, driverId } = await req.json();
    
    console.log(`Calculando folha de pagamento: ${mes}/${ano}${driverId ? ` para motorista ${driverId}` : ""}`);

    // Buscar configuração de remuneração
    const { data: config } = await supabase
      .from("driver_compensation_config")
      .select("*")
      .limit(1)
      .single();

    if (!config) {
      throw new Error("Configuração de remuneração não encontrada");
    }

    // Buscar todos os motoristas ou apenas um específico
    const driversQuery = supabase
      .from("profiles")
      .select("id, full_name, email");
    
    if (driverId) {
      driversQuery.eq("id", driverId);
    }

    const { data: drivers } = await driversQuery;

    if (!drivers || drivers.length === 0) {
      throw new Error("Nenhum motorista encontrado");
    }

    const results = [];

    for (const driver of drivers) {
      // Verificar se já existe folha para este período
      const { data: existing } = await supabase
        .from("driver_payroll")
        .select("id")
        .eq("driver_id", driver.id)
        .eq("mes", mes)
        .eq("ano", ano)
        .maybeSingle();

      if (existing) {
        console.log(`Folha já existe para ${driver.full_name} em ${mes}/${ano}`);
        continue;
      }

      // Buscar todas as sessões do período
      const dataInicio = new Date(ano, mes - 1, 1).toISOString();
      const dataFim = new Date(ano, mes, 0, 23, 59, 59).toISOString();

      const { data: sessions } = await supabase
        .from("driver_work_sessions")
        .select("*")
        .eq("driver_id", driver.id)
        .eq("status", "concluida")
        .gte("data_inicio", dataInicio)
        .lte("data_fim", dataFim);

      if (!sessions || sessions.length === 0) {
        console.log(`Nenhuma sessão encontrada para ${driver.full_name}`);
        continue;
      }

      // Calcular totais
      let totalMinutosNormais = 0;
      let totalMinutosExtras = 0;
      let totalMinutosEspera = 0;

      for (const session of sessions) {
        const trabalhoMinutos = session.total_trabalho_minutos || 0;
        const esperaMinutos = session.total_espera_minutos || 0;
        const extrasMinutos = session.horas_extras_minutos || 0;

        // Considera 8h (480min) como jornada normal
        const minutosNormaisSessao = Math.min(trabalhoMinutos, 480);
        totalMinutosNormais += minutosNormaisSessao;
        totalMinutosExtras += extrasMinutos;
        totalMinutosEspera += esperaMinutos;
      }

      const horasNormais = totalMinutosNormais / 60;
      const horasExtras = totalMinutosExtras / 60;
      const horasEspera = totalMinutosEspera / 60;

      // Calcular valores
      const valorHorasNormais = horasNormais * Number(config.valor_hora_normal);
      const valorHorasExtras = horasExtras * Number(config.valor_hora_extra);
      const valorHorasEspera = horasEspera * Number(config.valor_hora_espera);

      // Buscar CTEs do período para calcular gratificação
      const { data: ctes } = await supabase
        .from("cte")
        .select("valor_frete, trip_id")
        .in("trip_id", sessions.map(s => s.trip_id).filter(Boolean));

      const totalValorCtes = ctes?.reduce((sum, cte) => sum + Number(cte.valor_frete || 0), 0) || 0;

      // Buscar combustível gasto
      const { data: refuelings } = await supabase
        .from("refuelings")
        .select("total_value")
        .eq("driver_id", driver.id)
        .gte("timestamp", dataInicio)
        .lte("timestamp", dataFim);

      const totalCombustivel = refuelings?.reduce((sum, r) => sum + Number(r.total_value || 0), 0) || 0;

      // Calcular gratificação: (valor_ctes - 17% - combustivel) * 3%
      const descontoCte = totalValorCtes * Number(config.percentual_desconto_cte);
      const baseGratificacao = Math.max(0, totalValorCtes - descontoCte - totalCombustivel);
      const valorGratificacao = baseGratificacao * Number(config.percentual_gratificacao);

      const totalBruto = Number(config.salario_base) + valorHorasNormais + valorHorasExtras + 
                        valorHorasEspera + valorGratificacao;

      // Inserir folha de pagamento
      const { data: payroll, error: payrollError } = await supabase
        .from("driver_payroll")
        .insert({
          driver_id: driver.id,
          mes,
          ano,
          horas_normais: horasNormais,
          horas_extras: horasExtras,
          horas_espera: horasEspera,
          valor_horas_normais: valorHorasNormais,
          valor_horas_extras: valorHorasExtras,
          valor_horas_espera: valorHorasEspera,
          salario_base: config.salario_base,
          total_valor_ctes: totalValorCtes,
          total_combustivel: totalCombustivel,
          base_calculo_gratificacao: baseGratificacao,
          valor_gratificacao: valorGratificacao,
          total_bruto: totalBruto,
          total_descontos: 0,
          total_liquido: totalBruto,
          status: "calculado",
          dados_detalhados: {
            sessions: sessions.length,
            ctes: ctes?.length || 0,
            refuelings: refuelings?.length || 0,
            config_usado: config,
          },
        })
        .select()
        .single();

      if (payrollError) {
        console.error(`Erro ao criar folha para ${driver.full_name}:`, payrollError);
        continue;
      }

      results.push({
        driver: driver.full_name,
        payroll: payroll,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao calcular folha:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});