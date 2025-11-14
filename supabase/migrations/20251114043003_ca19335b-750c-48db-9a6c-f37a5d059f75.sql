-- Tabela para conversas do chatbot
CREATE TABLE chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL CHECK (type IN ('support', 'internal', 'help')),
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid REFERENCES auth.users(id),
  ticket_number text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz
);

-- Tabela para mensagens do chatbot
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id),
  message text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz
);

-- Tabela para assinaturas digitais
CREATE TABLE digital_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('weekly_journey', 'payroll', 'service_order')),
  signer_id uuid NOT NULL REFERENCES auth.users(id),
  signature_data text NOT NULL, -- Base64 da assinatura
  ip_address text,
  user_agent text,
  signed_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text
);

-- Tabela para templates de FAQ do chatbot
CREATE TABLE chat_faq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  keywords text[] DEFAULT ARRAY[]::text[],
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX idx_chat_conversations_assigned ON chat_conversations(assigned_to);
CREATE INDEX idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_digital_signatures_report ON digital_signatures(report_id, report_type);

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_faq ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias conversas
CREATE POLICY "Usuários podem ver suas conversas"
  ON chat_conversations FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_to OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'logistics_manager')
  );

-- Usuários podem criar conversas
CREATE POLICY "Usuários podem criar conversas"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gestores podem atualizar conversas
CREATE POLICY "Gestores podem atualizar conversas"
  ON chat_conversations FOR UPDATE
  USING (
    auth.uid() = assigned_to OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'logistics_manager')
  );

-- Usuários podem ver mensagens de suas conversas
CREATE POLICY "Usuários podem ver mensagens de suas conversas"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR assigned_to = auth.uid() OR 
           has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'))
    )
  );

-- Usuários podem criar mensagens em suas conversas
CREATE POLICY "Usuários podem criar mensagens"
  ON chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (user_id = auth.uid() OR assigned_to = auth.uid() OR 
           has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'logistics_manager'))
    )
  );

-- Usuários podem ver suas assinaturas
CREATE POLICY "Usuários podem ver suas assinaturas"
  ON digital_signatures FOR SELECT
  USING (
    auth.uid() = signer_id OR
    has_role(auth.uid(), 'admin') OR
    has_role(auth.uid(), 'logistics_manager')
  );

-- Usuários podem criar assinaturas
CREATE POLICY "Usuários podem criar assinaturas"
  ON digital_signatures FOR INSERT
  WITH CHECK (auth.uid() = signer_id);

-- Todos podem ver FAQ
CREATE POLICY "Todos podem ver FAQ"
  ON chat_faq FOR SELECT
  USING (is_active = true);

-- Apenas admins podem gerenciar FAQ
CREATE POLICY "Admins podem gerenciar FAQ"
  ON chat_faq FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_faq_updated_at
  BEFORE UPDATE ON chat_faq
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar número de ticket
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TICKET-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('ticket_sequence')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence para tickets
CREATE SEQUENCE ticket_sequence START 1;

-- Trigger para gerar número de ticket
CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON chat_conversations
  FOR EACH ROW
  WHEN (NEW.type = 'support')
  EXECUTE FUNCTION generate_ticket_number();

-- Inserir FAQs iniciais
INSERT INTO chat_faq (category, question, answer, keywords) VALUES
('Jornada', 'Como registrar minha jornada de trabalho?', 'Para registrar sua jornada, acesse o menu "Jornada Motorista" e clique em "Iniciar Jornada". O sistema irá registrar automaticamente suas atividades conforme a Lei 13.103/2015.', ARRAY['jornada', 'registrar', 'iniciar', 'trabalho']),
('Jornada', 'Qual o limite de horas de trabalho por dia?', 'O limite é de 8 horas diárias, podendo ser estendido por até 4 horas extras (total de 12 horas), conforme acordo coletivo.', ARRAY['limite', 'horas', 'trabalho', 'extras']),
('Gratificação', 'Como é calculada minha gratificação?', 'A gratificação é calculada como 3% do valor após descontar 17% do valor dos CTe''s e o combustível gasto: (Valor CTe - 17% - Combustível) × 3%', ARRAY['gratificação', 'calculo', 'cte', 'combustível']),
('Sistema', 'Como acessar meus relatórios?', 'Você pode acessar seus relatórios no menu correspondente. Motoristas têm acesso aos relatórios de jornada e gratificações, mecânicos aos relatórios de manutenção, etc.', ARRAY['relatórios', 'acessar', 'visualizar']),
('Suporte', 'Como abrir um chamado de suporte?', 'Clique no ícone do chatbot e selecione "Abrir Chamado". Descreva seu problema e nossa equipe irá atendê-lo em breve.', ARRAY['chamado', 'suporte', 'ajuda', 'problema']);