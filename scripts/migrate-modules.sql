-- =============================================================================
-- Migração: Tabelas para módulos WMS, OMS, SCM e secundários
-- Aplicar via: psql $DATABASE_URL < scripts/migrate-modules.sql
-- =============================================================================

-- ===================== WMS - Warehouse Management =====================

CREATE TABLE IF NOT EXISTS wms_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  unit VARCHAR(20) DEFAULT 'un',
  quantity INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  unit_price NUMERIC(12,2) DEFAULT 0,
  location VARCHAR(50),
  zone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'ok',
  barcode VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wms_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES wms_products(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'saida', 'transferencia', 'ajuste')),
  quantity INTEGER NOT NULL,
  origin VARCHAR(255),
  destination VARCHAR(255),
  reason VARCHAR(255),
  user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wms_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  capacity_m3 NUMERIC(10,2) DEFAULT 0,
  occupation_pct NUMERIC(5,2) DEFAULT 0,
  type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== OMS - Order Management =====================

CREATE TABLE IF NOT EXISTS oms_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  client_name VARCHAR(255) NOT NULL,
  client_id UUID,
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  items_count INTEGER DEFAULT 0,
  total_value NUMERIC(14,2) DEFAULT 0,
  status VARCHAR(30) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'processando', 'separacao', 'transito', 'entregue', 'cancelado')),
  payment_status VARCHAR(20) DEFAULT 'pendente' CHECK (payment_status IN ('pendente', 'pago', 'parcial', 'atrasado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS oms_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES oms_orders(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  product_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL,
  total_price NUMERIC(14,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== SCM - Supply Chain Management =====================

CREATE TABLE IF NOT EXISTS scm_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  category VARCHAR(100),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(30),
  lead_time_days INTEGER DEFAULT 0,
  reliability_pct NUMERIC(5,2) DEFAULT 0,
  orders_month INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'bloqueado')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scm_purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES scm_suppliers(id),
  supplier_name VARCHAR(255),
  item_description VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2),
  total_value NUMERIC(14,2),
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'transito', 'recebido', 'cancelado')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== Maintenance Checklist =====================

CREATE TABLE IF NOT EXISTS maintenance_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_plate VARCHAR(20) NOT NULL,
  vehicle_id UUID,
  inspector_name VARCHAR(255),
  inspector_id UUID,
  checklist_type VARCHAR(50) DEFAULT 'pre_viagem',
  status VARCHAR(20) DEFAULT 'pendente',
  score NUMERIC(5,2),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES maintenance_checklists(id) ON DELETE CASCADE,
  category VARCHAR(100),
  item_name VARCHAR(255) NOT NULL,
  result VARCHAR(20) CHECK (result IN ('ok', 'atencao', 'critico', 'na')),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== ESG Dashboard =====================

CREATE TABLE IF NOT EXISTS esg_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period VARCHAR(20) NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  category VARCHAR(20) CHECK (category IN ('environmental', 'social', 'governance')),
  name VARCHAR(255) NOT NULL,
  value NUMERIC(14,4),
  unit VARCHAR(50),
  target NUMERIC(14,4),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== Cargo Marketplace =====================

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  origin_city VARCHAR(255),
  destination_city VARCHAR(255),
  cargo_type VARCHAR(100),
  weight_kg NUMERIC(10,2),
  volume_m3 NUMERIC(10,2),
  price NUMERIC(14,2),
  pickup_date DATE,
  delivery_date DATE,
  status VARCHAR(20) DEFAULT 'disponivel' CHECK (status IN ('disponivel', 'reservado', 'em_transporte', 'entregue', 'cancelado')),
  shipper_name VARCHAR(255),
  shipper_id UUID,
  carrier_name VARCHAR(255),
  carrier_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== Audit / SASSMAQ =====================

CREATE TABLE IF NOT EXISTS audit_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  auditor_name VARCHAR(255),
  auditor_id UUID,
  status VARCHAR(20) DEFAULT 'em_andamento',
  score NUMERIC(5,2),
  total_items INTEGER DEFAULT 0,
  completed_items INTEGER DEFAULT 0,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_id UUID REFERENCES audit_checklists(id) ON DELETE CASCADE,
  section VARCHAR(100),
  requirement VARCHAR(500) NOT NULL,
  result VARCHAR(20) CHECK (result IN ('conforme', 'nao_conforme', 'parcial', 'na')),
  evidence TEXT,
  corrective_action TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== POP - Processos Operacionais =====================

CREATE TABLE IF NOT EXISTS operational_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  version VARCHAR(10) DEFAULT '1.0',
  status VARCHAR(20) DEFAULT 'ativo',
  content TEXT,
  responsible VARCHAR(255),
  review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===================== Índices =====================

CREATE INDEX IF NOT EXISTS idx_wms_products_code ON wms_products(code);
CREATE INDEX IF NOT EXISTS idx_wms_products_status ON wms_products(status);
CREATE INDEX IF NOT EXISTS idx_wms_movements_product ON wms_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_wms_movements_type ON wms_movements(type);
CREATE INDEX IF NOT EXISTS idx_oms_orders_status ON oms_orders(status);
CREATE INDEX IF NOT EXISTS idx_oms_orders_client ON oms_orders(client_name);
CREATE INDEX IF NOT EXISTS idx_oms_order_items_order ON oms_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_scm_suppliers_status ON scm_suppliers(status);
CREATE INDEX IF NOT EXISTS idx_scm_po_status ON scm_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_scm_po_supplier ON scm_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_status ON marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_audit_status ON audit_checklists(status);
