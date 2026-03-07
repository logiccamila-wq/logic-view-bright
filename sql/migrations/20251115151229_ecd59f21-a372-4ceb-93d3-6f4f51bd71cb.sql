-- Criar tabela de controle de ponto dos mecânicos
CREATE TABLE IF NOT EXISTS public.mechanic_clock_in (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mechanic_id UUID NOT NULL REFERENCES auth.users(id),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  within_area BOOLEAN NOT NULL DEFAULT true,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.mechanic_clock_in ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Mecânicos podem ver seus próprios pontos"
  ON public.mechanic_clock_in
  FOR SELECT
  USING (auth.uid() = mechanic_id);

CREATE POLICY "Mecânicos podem inserir seus próprios pontos"
  ON public.mechanic_clock_in
  FOR INSERT
  WITH CHECK (auth.uid() = mechanic_id);

-- Gestores e admins podem ver todos os pontos
CREATE POLICY "Gestores e admins podem ver todos os pontos"
  ON public.mechanic_clock_in
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'logistics_manager'::app_role)
  );

-- Criar índices para performance
CREATE INDEX idx_mechanic_clock_in_mechanic_id ON public.mechanic_clock_in(mechanic_id);
CREATE INDEX idx_mechanic_clock_in_timestamp ON public.mechanic_clock_in(timestamp DESC);