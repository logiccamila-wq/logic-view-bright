-- Adicionar coluna de subcategoria ao inventário existente
ALTER TABLE workshop_inventory 
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS barcode TEXT,
ADD COLUMN IF NOT EXISTS critical_stock INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Criar tabela de categorias de estoque
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar tabela de movimentações de estoque
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES workshop_inventory(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste', 'transferencia')),
  quantity INTEGER NOT NULL,
  reason TEXT NOT NULL,
  reference_document TEXT,
  responsible_user_id UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

-- Políticas para inventory_categories
CREATE POLICY "Admins and maintenance can view categories"
  ON inventory_categories FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR
    has_role(auth.uid(), 'maintenance_assistant'::app_role)
  );

CREATE POLICY "Only admins can manage categories"
  ON inventory_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para inventory_movements
CREATE POLICY "Staff can view inventory movements"
  ON inventory_movements FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR
    has_role(auth.uid(), 'maintenance_assistant'::app_role)
  );

CREATE POLICY "Staff can create inventory movements"
  ON inventory_movements FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'fleet_maintenance'::app_role) OR
    has_role(auth.uid(), 'maintenance_assistant'::app_role)
  );

-- Trigger para atualizar updated_at
CREATE TRIGGER update_inventory_categories_updated_at
  BEFORE UPDATE ON inventory_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO inventory_categories (name, description, icon) VALUES
  ('Peças Mecânicas', 'Peças para manutenção mecânica de veículos', 'wrench'),
  ('Pneus e Rodas', 'Pneus, câmaras e acessórios para rodas', 'circle'),
  ('Filtros', 'Filtros de óleo, ar, combustível e cabine', 'filter'),
  ('Fluidos', 'Óleos, lubrificantes e fluidos automotivos', 'droplet'),
  ('Elétrica', 'Componentes elétricos e eletrônicos', 'zap'),
  ('Lavajato - Químicos', 'Produtos químicos para lavagem', 'spray-can'),
  ('Lavajato - Consumíveis', 'Esponjas, panos, ceras e acessórios', 'package'),
  ('Ferramentas', 'Ferramentas e equipamentos', 'hammer')
ON CONFLICT (name) DO NOTHING;