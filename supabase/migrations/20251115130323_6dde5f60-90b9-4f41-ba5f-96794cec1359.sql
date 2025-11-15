-- Corrigir search_path das funções criadas
DROP FUNCTION IF EXISTS check_expiring_documents();
DROP FUNCTION IF EXISTS generate_document_expiry_notifications();

-- Recriar função para verificar documentos vencendo com search_path
CREATE OR REPLACE FUNCTION check_expiring_documents()
RETURNS TABLE (
  vehicle_plate TEXT,
  document_type TEXT,
  expiry_date TIMESTAMP WITH TIME ZONE,
  days_until_expiry INTEGER,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Recriar função para gerar notificações de vencimento com search_path
CREATE OR REPLACE FUNCTION generate_document_expiry_notifications()
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;