-- Tabela de documentos de veículos
CREATE TABLE IF NOT EXISTS public.vehicle_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_plate TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'chemical', 'civ', 'cipp', 'tachograph', 'fine', 'cnh', 'crlv'
  document_category TEXT, -- Para químicos: 'FISPQ', 'Certificado ONU', etc
  document_number TEXT,
  issue_date TIMESTAMP WITH TIME ZONE,
  expiry_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'valid', -- 'valid', 'expiring', 'expired', 'pending'
  value NUMERIC, -- Para multas
  description TEXT,
  file_url TEXT, -- Link para arquivo no storage
  driver_name TEXT, -- Para CNH
  driver_cpf TEXT, -- Para CNH
  cnh_category TEXT, -- Para CNH
  year INTEGER, -- Para CRLV
  paid BOOLEAN DEFAULT false, -- Para CRLV e multas
  last_check TIMESTAMP WITH TIME ZONE, -- Para tacógrafo
  next_check TIMESTAMP WITH TIME ZONE, -- Para tacógrafo
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_plate ON public.vehicle_documents(vehicle_plate);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_type ON public.vehicle_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_status ON public.vehicle_documents(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_documents_expiry ON public.vehicle_documents(expiry_date);

-- RLS Policies
ALTER TABLE public.vehicle_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestores podem ver documentos"
  ON public.vehicle_documents FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR
    has_role(auth.uid(), 'maintenance_assistant'::app_role)
  );

CREATE POLICY "Gestores podem criar documentos"
  ON public.vehicle_documents FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role)
  );

CREATE POLICY "Gestores podem atualizar documentos"
  ON public.vehicle_documents FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role)
  );

CREATE POLICY "Gestores podem deletar documentos"
  ON public.vehicle_documents FOR DELETE
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'logistics_manager'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_vehicle_documents_updated_at
  BEFORE UPDATE ON public.vehicle_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();