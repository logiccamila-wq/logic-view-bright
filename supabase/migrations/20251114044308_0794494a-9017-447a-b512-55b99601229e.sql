-- Remover trigger e recriar função com search_path
DROP TRIGGER IF EXISTS generate_ticket_number_trigger ON chat_conversations;
DROP FUNCTION IF EXISTS generate_ticket_number() CASCADE;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.ticket_number := 'TICKET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

-- Recriar trigger
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON chat_conversations
  FOR EACH ROW
  WHEN (NEW.type = 'support')
  EXECUTE FUNCTION generate_ticket_number();