-- Adicionar novos tipos de documentos ao enum
DO $$ 
BEGIN
  -- Criar um tipo temporário com todos os valores
  CREATE TYPE document_type_new AS ENUM (
    'chemical',
    'civ',
    'cipp',
    'tachograph',
    'fine',
    'cnh',
    'crlv',
    'fire_extinguisher',
    'ibama_ctf',
    'ibama_aatipp',
    'antt',
    'opacity_test',
    'noise_test'
  );
  
  -- Alterar a coluna para usar o novo tipo
  ALTER TABLE vehicle_documents 
    ALTER COLUMN document_type TYPE document_type_new 
    USING document_type::text::document_type_new;
  
  -- Remover o tipo antigo e renomear o novo
  DROP TYPE IF EXISTS document_type CASCADE;
  ALTER TYPE document_type_new RENAME TO document_type;
END $$;

-- Adicionar campos para ANTT
ALTER TABLE vehicle_documents 
  ADD COLUMN IF NOT EXISTS antt_number TEXT,
  ADD COLUMN IF NOT EXISTS antt_expiry_date TIMESTAMP WITH TIME ZONE;

-- Adicionar campos para extintores (múltiplos)
ALTER TABLE vehicle_documents 
  ADD COLUMN IF NOT EXISTS extinguisher_data JSONB DEFAULT '[]'::jsonb;

-- Criar função para verificar documentos vencendo
CREATE OR REPLACE FUNCTION check_expiring_documents()
RETURNS TABLE (
  vehicle_plate TEXT,
  document_type TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vd.vehicle_plate,
    vd.document_type::TEXT,
    vd.expiry_date,
    EXTRACT(DAY FROM (vd.expiry_date - CURRENT_DATE))::INTEGER as days_until_expiry,
    CASE
      WHEN vd.expiry_date < CURRENT_DATE THEN 'expired'
      WHEN vd.expiry_date <= (CURRENT_DATE + INTERVAL '30 days') THEN 'expiring'
      ELSE 'valid'
    END as status
  FROM vehicle_documents vd
  WHERE vd.expiry_date IS NOT NULL
    AND vd.expiry_date <= (CURRENT_DATE + INTERVAL '90 days')
  ORDER BY vd.expiry_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para gerar notificações de vencimento
CREATE OR REPLACE FUNCTION generate_document_expiry_notifications()
RETURNS void AS $$
DECLARE
  doc_record RECORD;
  notification_title TEXT;
  notification_message TEXT;
BEGIN
  FOR doc_record IN 
    SELECT * FROM check_expiring_documents() 
    WHERE status IN ('expired', 'expiring')
  LOOP
    IF doc_record.status = 'expired' THEN
      notification_title := 'Documento Vencido';
      notification_message := format(
        'O documento %s do veículo %s está VENCIDO desde %s dias.',
        doc_record.document_type,
        doc_record.vehicle_plate,
        ABS(doc_record.days_until_expiry)
      );
    ELSE
      notification_title := 'Documento Vencendo';
      notification_message := format(
        'O documento %s do veículo %s vencerá em %s dias.',
        doc_record.document_type,
        doc_record.vehicle_plate,
        doc_record.days_until_expiry
      );
    END IF;
    
    -- Inserir notificação para todos os gestores
    INSERT INTO notifications (user_id, title, message, type, module)
    SELECT 
      ur.user_id,
      notification_title,
      notification_message,
      CASE WHEN doc_record.status = 'expired' THEN 'error'::notification_type ELSE 'warning'::notification_type END,
      'documents'
    FROM user_roles ur
    WHERE ur.role IN ('admin', 'logistics_manager', 'fleet_maintenance')
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;