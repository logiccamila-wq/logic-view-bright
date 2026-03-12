-- Criar enum para tipos de atividade do motorista
CREATE TYPE driver_activity_type AS ENUM (
  'direcao',
  'descanso',
  'refeicao',
  'espera',
  'trabalho',
  'intervalo'
);

-- Criar enum para tipos de violação
CREATE TYPE violation_type AS ENUM (
  'direcao_continua_excedida',
  'jornada_diaria_excedida',
  'intervalo_interjornada_insuficiente',
  'intervalo_refeicao_insuficiente',
  'horas_extras_excedidas'
);

-- Tabela de sessões de trabalho (jornadas diárias)
CREATE TABLE driver_work_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  vehicle_plate TEXT NOT NULL,
  trip_id UUID REFERENCES trips(id),
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  total_direcao_minutos INTEGER DEFAULT 0,
  total_trabalho_minutos INTEGER DEFAULT 0,
  total_espera_minutos INTEGER DEFAULT 0,
  total_descanso_minutos INTEGER DEFAULT 0,
  horas_extras_minutos INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  tipo_motorista TEXT NOT NULL DEFAULT 'carga', -- 'carga' ou 'passageiros'
  localizacao_inicio JSONB,
  localizacao_fim JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de eventos de jornada
CREATE TABLE driver_work_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES driver_work_sessions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  tipo_atividade driver_activity_type NOT NULL,
  data_hora_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_hora_fim TIMESTAMP WITH TIME ZONE,
  duracao_minutos INTEGER,
  localizacao JSONB,
  observacoes TEXT,
  automatico BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de violações detectadas
CREATE TABLE driver_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES driver_work_sessions(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL,
  tipo_violacao violation_type NOT NULL,
  descricao TEXT NOT NULL,
  severidade TEXT NOT NULL DEFAULT 'media', -- 'baixa', 'media', 'alta'
  valor_registrado NUMERIC,
  valor_maximo_permitido NUMERIC,
  data_hora_violacao TIMESTAMP WITH TIME ZONE NOT NULL,
  resolvida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de relatórios semanais
CREATE TABLE driver_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL,
  ano INTEGER NOT NULL,
  semana INTEGER NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  total_horas_trabalhadas NUMERIC NOT NULL DEFAULT 0,
  total_horas_direcao NUMERIC NOT NULL DEFAULT 0,
  total_horas_espera NUMERIC NOT NULL DEFAULT 0,
  total_horas_extras NUMERIC NOT NULL DEFAULT 0,
  total_violacoes INTEGER DEFAULT 0,
  assinado_motorista BOOLEAN DEFAULT false,
  data_assinatura TIMESTAMP WITH TIME ZONE,
  assinado_gestor BOOLEAN DEFAULT false,
  data_assinatura_gestor TIMESTAMP WITH TIME ZONE,
  gestor_id UUID,
  dados_detalhados JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(driver_id, ano, semana)
);

-- Índices para performance
CREATE INDEX idx_work_sessions_driver ON driver_work_sessions(driver_id);
CREATE INDEX idx_work_sessions_status ON driver_work_sessions(status);
CREATE INDEX idx_work_events_session ON driver_work_events(session_id);
CREATE INDEX idx_work_events_driver ON driver_work_events(driver_id);
CREATE INDEX idx_violations_driver ON driver_violations(driver_id);
CREATE INDEX idx_violations_session ON driver_violations(session_id);
CREATE INDEX idx_weekly_reports_driver ON driver_weekly_reports(driver_id);

-- RLS Policies para driver_work_sessions
ALTER TABLE driver_work_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motoristas podem ver suas próprias sessões"
  ON driver_work_sessions FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Motoristas podem criar suas sessões"
  ON driver_work_sessions FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

CREATE POLICY "Motoristas podem atualizar suas sessões"
  ON driver_work_sessions FOR UPDATE
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

-- RLS Policies para driver_work_events
ALTER TABLE driver_work_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motoristas podem ver seus eventos"
  ON driver_work_events FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Motoristas podem criar eventos"
  ON driver_work_events FOR INSERT
  WITH CHECK (auth.uid() = driver_id);

-- RLS Policies para driver_violations
ALTER TABLE driver_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motoristas e gestores podem ver violações"
  ON driver_violations FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager') OR has_role(auth.uid(), 'fleet_maintenance'));

CREATE POLICY "Sistema pode criar violações"
  ON driver_violations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Gestores podem atualizar violações"
  ON driver_violations FOR UPDATE
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

-- RLS Policies para driver_weekly_reports
ALTER TABLE driver_weekly_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motoristas podem ver seus relatórios"
  ON driver_weekly_reports FOR SELECT
  USING (auth.uid() = driver_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

CREATE POLICY "Sistema pode criar relatórios"
  ON driver_weekly_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Motoristas podem assinar relatórios"
  ON driver_weekly_reports FOR UPDATE
  USING (auth.uid() = driver_id OR auth.uid() = gestor_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_work_sessions_updated_at
  BEFORE UPDATE ON driver_work_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_weekly_reports_updated_at
  BEFORE UPDATE ON driver_weekly_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();