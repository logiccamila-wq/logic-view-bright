-- Tabela de ponto do mecânico (clock-in/out) com tipos de marcação
CREATE TABLE IF NOT EXISTS mechanic_clock_in (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  punch_type TEXT NOT NULL CHECK (punch_type IN ('entrada','almoco_inicio','almoco_fim','saida')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance DOUBLE PRECISION,
  within_area BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE mechanic_clock_in ENABLE ROW LEVEL SECURITY;

-- Políticas: mecânico vê os próprios registros
CREATE POLICY "Mechanic can view own clock records"
  ON mechanic_clock_in FOR SELECT
  USING (
    auth.uid() = mechanic_id OR
    has_role(auth.uid(), 'maintenance_manager'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Inserção permitida para mecânicos e assistentes de manutenção
CREATE POLICY "Mechanic staff can insert clock records"
  ON mechanic_clock_in FOR INSERT
  WITH CHECK (
    auth.uid() = mechanic_id AND (
      has_role(auth.uid(), 'fleet_maintenance'::app_role) OR
      has_role(auth.uid(), 'maintenance_assistant'::app_role) OR
      has_role(auth.uid(), 'maintenance_manager'::app_role) OR
      has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Atualização somente por gestores/admin se necessário (não usual)
CREATE POLICY "Managers can update clock records"
  ON mechanic_clock_in FOR UPDATE
  USING (
    has_role(auth.uid(), 'maintenance_manager'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Exclusão somente admin
CREATE POLICY "Admins can delete clock records"
  ON mechanic_clock_in FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));