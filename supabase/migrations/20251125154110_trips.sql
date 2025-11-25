-- Tabela de viagens para módulo de Aprovações
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES auth.users(id),
  driver_name TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente','aprovada','em_andamento','concluida','cancelada')) DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  estimated_departure TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Políticas de SELECT: operações, gestores e admin podem ver tudo; motoristas veem suas próprias
CREATE POLICY "Ops, managers and admin can view trips"
  ON trips FOR SELECT
  USING (
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'maintenance_manager'::app_role) OR
    has_role(auth.uid(), 'finance'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    auth.uid() = driver_id
  );

-- Inserção: operações e motoristas podem criar viagens pendentes
CREATE POLICY "Drivers and ops can insert trips"
  ON trips FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'operations'::app_role) OR auth.uid() = driver_id
  );

-- Atualização de aprovação: operações, gestores e admin podem aprovar/cancelar
CREATE POLICY "Ops and managers can update approval status"
  ON trips FOR UPDATE
  USING (
    has_role(auth.uid(), 'operations'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'maintenance_manager'::app_role) OR
    has_role(auth.uid(), 'finance'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );