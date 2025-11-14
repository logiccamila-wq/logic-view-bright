import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constantes da Lei nº 13.103/2015
const JORNADA_NORMAL_MIN = 8 * 60; // 8 horas em minutos
const HORAS_EXTRAS_MAX_MIN = 4 * 60; // 4 horas extras máximas
const JORNADA_MAX_MIN = JORNADA_NORMAL_MIN + HORAS_EXTRAS_MAX_MIN; // 12 horas total

const DIRECAO_CONTINUA_CARGA_MAX_MIN = 5.5 * 60; // 5h30min para carga
const DIRECAO_CONTINUA_PASSAGEIROS_MAX_MIN = 4 * 60; // 4h para passageiros

const INTERVALO_INTERJORNADA_MIN_MIN = 11 * 60; // 11 horas mínimas
const INTERVALO_INTERJORNADA_ININTERRUPTO_MIN = 8 * 60; // 8 horas ininterruptas obrigatórias

const INTERVALO_REFEICAO_MIN_MIN = 60; // 1 hora mínima
const PARADA_OBRIGATORIA_MIN = 30; // 30 minutos a cada período de direção

interface WorkEvent {
  id: string;
  tipo_atividade: string;
  data_hora_inicio: string;
  data_hora_fim: string | null;
  duracao_minutos: number | null;
}

interface Violation {
  tipo_violacao: string;
  descricao: string;
  severidade: string;
  valor_registrado: number;
  valor_maximo_permitido: number;
  data_hora_violacao: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { sessionId } = await req.json();

    console.log('Analisando jornada para sessão:', sessionId);

    // Buscar sessão
    const { data: session, error: sessionError } = await supabase
      .from('driver_work_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Buscar todos os eventos da sessão
    const { data: events, error: eventsError } = await supabase
      .from('driver_work_events')
      .select('*')
      .eq('session_id', sessionId)
      .order('data_hora_inicio', { ascending: true });

    if (eventsError) throw eventsError;

    const violations: Violation[] = [];

    // 1. Análise de tempo de direção contínua
    const direcaoEvents = events.filter((e: WorkEvent) => e.tipo_atividade === 'direcao');
    let direcaoContinuaMinutos = 0;
    let ultimaParada: Date | null = null;

    const maxDirecaoContinua = session.tipo_motorista === 'passageiros'
      ? DIRECAO_CONTINUA_PASSAGEIROS_MAX_MIN
      : DIRECAO_CONTINUA_CARGA_MAX_MIN;

    for (const event of direcaoEvents) {
      const inicio = new Date(event.data_hora_inicio);
      const fim = event.data_hora_fim ? new Date(event.data_hora_fim) : new Date();

      if (ultimaParada) {
        const pausaMinutos = (inicio.getTime() - ultimaParada.getTime()) / (1000 * 60);
        if (pausaMinutos >= PARADA_OBRIGATORIA_MIN) {
          direcaoContinuaMinutos = 0; // Reset após parada válida
        }
      }

      const duracaoMinutos = (fim.getTime() - inicio.getTime()) / (1000 * 60);
      direcaoContinuaMinutos += duracaoMinutos;

      if (direcaoContinuaMinutos > maxDirecaoContinua) {
        violations.push({
          tipo_violacao: 'direcao_continua_excedida',
          descricao: `Tempo de direção contínua excedeu ${maxDirecaoContinua / 60}h sem parada de 30min`,
          severidade: 'alta',
          valor_registrado: direcaoContinuaMinutos,
          valor_maximo_permitido: maxDirecaoContinua,
          data_hora_violacao: event.data_hora_inicio,
        });
      }

      ultimaParada = fim;
    }

    // 2. Análise de jornada diária total
    const totalTrabalhoMinutos = session.total_trabalho_minutos || 0;
    if (totalTrabalhoMinutos > JORNADA_MAX_MIN) {
      violations.push({
        tipo_violacao: 'jornada_diaria_excedida',
        descricao: `Jornada diária excedeu ${JORNADA_MAX_MIN / 60}h (incluindo horas extras)`,
        severidade: 'alta',
        valor_registrado: totalTrabalhoMinutos,
        valor_maximo_permitido: JORNADA_MAX_MIN,
        data_hora_violacao: session.data_inicio,
      });
    }

    // 3. Análise de horas extras
    const horasExtrasMinutos = Math.max(0, totalTrabalhoMinutos - JORNADA_NORMAL_MIN);
    if (horasExtrasMinutos > HORAS_EXTRAS_MAX_MIN) {
      violations.push({
        tipo_violacao: 'horas_extras_excedidas',
        descricao: `Horas extras excederam ${HORAS_EXTRAS_MAX_MIN / 60}h`,
        severidade: 'media',
        valor_registrado: horasExtrasMinutos,
        valor_maximo_permitido: HORAS_EXTRAS_MAX_MIN,
        data_hora_violacao: session.data_inicio,
      });
    }

    // 4. Análise de intervalos de refeição
    const refeicaoEvents = events.filter((e: WorkEvent) => e.tipo_atividade === 'refeicao');
    for (const event of refeicaoEvents) {
      const duracaoMinutos = event.duracao_minutos || 0;
      if (duracaoMinutos < INTERVALO_REFEICAO_MIN_MIN) {
        violations.push({
          tipo_violacao: 'intervalo_refeicao_insuficiente',
          descricao: `Intervalo de refeição menor que ${INTERVALO_REFEICAO_MIN_MIN}min`,
          severidade: 'media',
          valor_registrado: duracaoMinutos,
          valor_maximo_permitido: INTERVALO_REFEICAO_MIN_MIN,
          data_hora_violacao: event.data_hora_inicio,
        });
      }
    }

    // 5. Análise de intervalo interjornada (descanso entre jornadas)
    const { data: previousSession } = await supabase
      .from('driver_work_sessions')
      .select('data_fim')
      .eq('driver_id', session.driver_id)
      .lt('data_inicio', session.data_inicio)
      .order('data_fim', { ascending: false })
      .limit(1)
      .single();

    if (previousSession && previousSession.data_fim) {
      const fimAnterior = new Date(previousSession.data_fim);
      const inicioAtual = new Date(session.data_inicio);
      const intervaloMinutos = (inicioAtual.getTime() - fimAnterior.getTime()) / (1000 * 60);

      if (intervaloMinutos < INTERVALO_INTERJORNADA_MIN_MIN) {
        violations.push({
          tipo_violacao: 'intervalo_interjornada_insuficiente',
          descricao: `Intervalo entre jornadas menor que ${INTERVALO_INTERJORNADA_MIN_MIN / 60}h`,
          severidade: 'alta',
          valor_registrado: intervaloMinutos,
          valor_maximo_permitido: INTERVALO_INTERJORNADA_MIN_MIN,
          data_hora_violacao: session.data_inicio,
        });
      }
    }

    // Salvar violações no banco
    if (violations.length > 0) {
      const violationsToInsert = violations.map(v => ({
        ...v,
        session_id: sessionId,
        driver_id: session.driver_id,
      }));

      const { error: violationsError } = await supabase
        .from('driver_violations')
        .insert(violationsToInsert);

      if (violationsError) {
        console.error('Erro ao salvar violações:', violationsError);
      }
    }

    // Atualizar totais da sessão
    const { error: updateError } = await supabase
      .from('driver_work_sessions')
      .update({
        horas_extras_minutos: Math.max(0, totalTrabalhoMinutos - JORNADA_NORMAL_MIN),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Erro ao atualizar sessão:', updateError);
    }

    console.log(`Análise concluída. ${violations.length} violações detectadas.`);

    return new Response(
      JSON.stringify({
        success: true,
        violations: violations.length,
        details: violations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erro na análise de jornada:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
