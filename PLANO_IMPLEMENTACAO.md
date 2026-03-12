# 🚀 Plano de Implementação OptiLog - Módulos Avançados

## 📊 Status Atual (Auditoria Completa)

### ✅ Módulos Existentes
- **Login/Auth** - Stack Auth + JWT (funcionando)
- **Dashboard** - Visão geral operacional  
- **Control Tower** - Monitoramento de frotas em tempo real
- **Finance** - Resumo financeiro básico
- **BI** - Business Intelligence (placeholder)
- **Driver** - App do motorista (placeholder)
- **Pneus** - Movimentação e controle básico (backend + frontend parcial)
- **Tire Dashboard** - Visualização de manutenção
- **Mechanic** - Área do mecânico
- **Operações** - Gestão operacional
- **Frota** - Gestão de veículos
- **Admin** - Administração
- **Supergestor** - Visão executiva
- **AI** - Módulos de IA (parcial)
- **Chat** - Interface conversacional

### ⚠️ Módulos Incompletos / Em Desenvolvimento
- **Gestão de Pneus** - Falta: recapagens, custo/km, vida útil detalhada, alertas preventivos
- **Ordem de Serviço** - Não existe sistema completo de OS
- **CTe/Documentos** - Não existe módulo de upload/gestão
- **Extratos Bancários** - Não implementado
- **IA/ML Preditiva** - Parcialmente implementado, falta modelos treinados
- **AI Hub (Ecossistema)** - Não existe integração multi-IA
- **Developer Module** - Não existe
- **Roteirização Avançada** - Básico, falta otimização OR-Tools
- **SASSMAQ/ISO** - Não implementado
- **Indicadores Encarregados** - Não existe dashboard específico

---

## 🎯 Prioridade de Implementação (Baseado em ROI e Urgência)

### 🔥 **FASE 1: Crítico (Semana 1-2)** - Funcionalidades Core do TMS
1. **Ordem de Serviço Completa** ⭐⭐⭐
   - Workflow: Abertura → Aprovação → Execução → Fechamento
   - Upload de fotos/anexos
   - Assinatura digital
   - Peças utilizadas + custos
   - Dashboard para encarregados/mecânicos

2. **Gestão de Documentos (CTe/NF-e)** ⭐⭐⭐
   - Upload de CTe, NF-e, MDFe
   - OCR para extração de dados
   - Validação SEFAZ
   - Arquivo digital organizado

3. **Gestão de Pneus Avançada** ⭐⭐
   - Recapagens (1ª, 2ª, 3ª vida)
   - Custo por KM
   - Alertas preventivos (profundidade < 3mm)
   - Histórico completo
   - Integração com TPMS (sensores IoT)

### 🚀 **FASE 2: Inteligência (Semana 3-4)** - IA/ML e Otimização
4. **AI Hub (Ecossistema IA)** ⭐⭐⭐
   - Chat corporativo com Azure OpenAI e copilotos especializados
   - Especialistas: CBT, Inventário, Manuais de Mecânica
   - RAG (Retrieval Augmented Generation) com docs internos
   - Assistente de manutenção preditiva

5. **IA/ML Preditiva** ⭐⭐
   - Previsão de falhas (motor, freios, pneus)
   - Otimização de manutenção preventiva
   - Análise de padrões de consumo
   - Recomendações automáticas

6. **Roteirização Avançada** ⭐⭐
   - Google OR-Tools para otimização
   - Multi-depot, janelas de tempo
   - Restrições personalizadas
   - Integração MapBox/HERE Maps

### 💼 **FASE 3: Gestão Avançada (Semana 5-6)** - ERP Features
7. **Extratos Bancários** ⭐⭐
   - Importação OFX/CSV (todos bancos brasileiros)
   - Conciliação automática
   - Categorização inteligente (ML)
   - Dashboard de fluxo de caixa

8. **SASSMAQ/ISO/Compliance** ⭐
   - Checklist de auditorias
   - Non-conformidades
   - Plano de ação (PDCA)
   - Certificações e vencimentos

9. **Indicadores Executivos** ⭐⭐
   - KPIs encarregados/supervisores
   - Dashboard personalizado por role
   - Metas e performance
   - Gamificação

### 🛠️ **FASE 4: Developer Experience (Semana 7-8)** - Low-Code
10. **Developer Module** ⭐
    - Workflow builder visual
    - API playground
    - Custom reports designer
    - Webhooks/integrações
    - Marketplace de plugins

---

## 📋 Especificação Técnica por Módulo

### 1️⃣ Ordem de Serviço (OS)

**Stack:**
- Frontend: Next.js + MUI + React Hook Form
- Backend: Node.js + Azure Database for PostgreSQL
- Storage: Azure Blob Storage (fotos/anexos)
- Assinatura: react-signature-canvas

**Schema:**
```sql
CREATE TABLE service_orders (
  id SERIAL PRIMARY KEY,
  number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_id INTEGER REFERENCES vehicles(id),
  mechanic_id INTEGER REFERENCES users(id),
  supervisor_id INTEGER REFERENCES users(id),
  type VARCHAR(50), -- preventiva, corretiva, preditiva
  priority VARCHAR(20), -- baixa, media, alta, urgente
  status VARCHAR(30), -- aberta, aprovada, em_execucao, fechada, cancelada
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  scheduled_date DATE,
  started_at TIMESTAMP,
  finished_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  total_cost DECIMAL(10,2),
  labor_hours DECIMAL(5,2),
  signature_url TEXT,
  notes TEXT
);

CREATE TABLE os_parts (
  id SERIAL PRIMARY KEY,
  os_id INTEGER REFERENCES service_orders(id),
  part_code VARCHAR(50),
  part_name VARCHAR(200),
  quantity INTEGER,
  unit_price DECIMAL(10,2),
  total_price DECIMAL(10,2)
);

CREATE TABLE os_attachments (
  id SERIAL PRIMARY KEY,
  os_id INTEGER REFERENCES service_orders(id),
  type VARCHAR(20), -- foto, pdf, nota_fiscal
  url TEXT,
  filename VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

**Features:**
- [ ] Abertura de OS com seleção de veículo
- [ ] Workflow de aprovação (supervisor)
- [ ] Checklist de tarefas
- [ ] Upload de fotos (antes/depois)
- [ ] Controle de peças (estoque)
- [ ] Assinatura digital (mecânico + supervisor)
- [ ] Impressão de OS
- [ ] Dashboard de OS (aberta, em andamento, fechada)
- [ ] Notificações (push/email)

### 2️⃣ Gestão de Documentos Fiscais

**Stack:**
- Frontend: Next.js + drag-and-drop (react-dropzone)
- OCR: Tesseract.js ou Google Vision API
- Validação: API SEFAZ
- Storage: Azure Blob Storage

**Schema:**
```sql
CREATE TABLE fiscal_documents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20), -- cte, nfe, mdfe
  number VARCHAR(50),
  series VARCHAR(10),
  access_key VARCHAR(44) UNIQUE,
  issuer_cnpj VARCHAR(18),
  issuer_name VARCHAR(255),
  receiver_cnpj VARCHAR(18),
  receiver_name VARCHAR(255),
  issue_date DATE,
  total_value DECIMAL(12,2),
  status VARCHAR(30), -- pendente, validado, cancelado
  xml_url TEXT,
  pdf_url TEXT,
  validated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Features:**
- [ ] Upload de XML/PDF
- [ ] OCR para extração de dados
- [ ] Validação automática SEFAZ
- [ ] Busca por chave de acesso
- [ ] Filtros (data, emitente, valor)
- [ ] Exportação Excel/PDF
- [ ] Dashboard de documentos

### 3️⃣ Gestão de Pneus Avançada

**Adicionar ao schema existente:**
```sql
ALTER TABLE tires ADD COLUMN brand VARCHAR(50);
ALTER TABLE tires ADD COLUMN model VARCHAR(100);
ALTER TABLE tires ADD COLUMN serial_number VARCHAR(50) UNIQUE;
ALTER TABLE tires ADD COLUMN purchase_date DATE;
ALTER TABLE tires ADD COLUMN purchase_price DECIMAL(10,2);
ALTER TABLE tires ADD COLUMN current_status VARCHAR(30); -- novo, recapado_1, recapado_2, descartado
ALTER TABLE tires ADD COLUMN km_installed INTEGER;
ALTER TABLE tires ADD COLUMN km_current INTEGER;
ALTER TABLE tires ADD COLUMN tread_depth DECIMAL(4,2); -- mm
ALTER TABLE tires ADD COLUMN last_inspection_date DATE;

CREATE TABLE tire_recaps (
  id SERIAL PRIMARY KEY,
  tire_id INTEGER REFERENCES tires(id),
  recap_number INTEGER, -- 1, 2, 3
  date DATE,
  supplier VARCHAR(255),
  cost DECIMAL(10,2),
  km_at_recap INTEGER
);

CREATE TABLE tire_inspections (
  id SERIAL PRIMARY KEY,
  tire_id INTEGER REFERENCES tires(id),
  date DATE,
  tread_depth DECIMAL(4,2),
  pressure DECIMAL(4,1),
  temperature DECIMAL(4,1),
  inspector_id INTEGER REFERENCES users(id),
  notes TEXT
);
```

**Features:**
- [ ] Cadastro completo (marca, modelo, série)
- [ ] Controle de recapagens (1ª, 2ª, 3ª vida)
- [ ] Cálculo de custo/km
- [ ] Alertas (profundidade < 3mm, pressão baixa)
- [ ] Histórico de movimentações
- [ ] Dashboard com gráficos (vida útil, custos)
- [ ] Integração TPMS (sensores IoT - WebSocket)

### 4️⃣ AI Hub (Ecossistema IA)

**Stack:**
- Frontend: Next.js + chat UI (stream responses)
- Backend: Node.js + Azure OpenAI SDK
- RAG: LangChain + Pinecone (vector DB)
- Modelos: GPT-4o e GitHub Copilot

**Arquitetura:**
```
User → AI Router → [GPT-4o | Copilot] → RAG (docs internos) → Response
```

**Especialistas:**
1. **CBT Expert** - Conhecimento de Transporte (ANTT, MOPPs)
2. **Mecânico** - Diagnóstico de falhas, manuais de reparo
3. **Inventário** - Gestão de estoque, alertas de reposição
4. **Financeiro** - Análise de custos, fluxo de caixa
5. **Roteamento** - Otimização de rotas
6. **Compliance** - SASSMAQ, ISO 9001, ISO 14001

**Features:**
- [ ] Chat com seleção de especialista
- [ ] Upload de manuais (PDF → embeddings)
- [ ] RAG com docs internos (OS, manuais, logs)
- [ ] Análise preditiva (manutenção, custos)
- [ ] Geração de relatórios automáticos
- [ ] Assistente de código (para dev module)

### 5️⃣ Roteirização Avançada

**Stack:**
- Frontend: Mapbox GL JS / Google Maps
- Otimização: Google OR-Tools (Python service)
- Backend: Node.js + Python microservice

**Features:**
- [ ] Multi-depot (várias bases)
- [ ] Janelas de tempo (time windows)
- [ ] Restrições de veículo (capacidade, tipo)
- [ ] Otimização de custo/tempo/distância
- [ ] Simulação de cenários
- [ ] Exportação de rotas (GPX, KML)

### 6️⃣ Extratos Bancários

**Stack:**
- Parser: OFX.js / ofxparser
- ML: TensorFlow.js (categorização)
- Bancos: Itaú, Bradesco, BB, Santander, Nubank, Inter, etc.

**Schema:**
```sql
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  bank_name VARCHAR(100),
  account_number VARCHAR(30),
  agency VARCHAR(10),
  balance DECIMAL(12,2),
  last_sync TIMESTAMP
);

CREATE TABLE bank_transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES bank_accounts(id),
  date DATE,
  description TEXT,
  amount DECIMAL(12,2),
  type VARCHAR(20), -- debit, credit
  category VARCHAR(50), -- combustivel, pedagio, manutencao, etc.
  reconciled BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

**Features:**
- [ ] Import OFX/CSV
- [ ] Categorização automática (ML)
- [ ] Conciliação com CTe/NF-e
- [ ] Dashboard de fluxo de caixa
- [ ] Previsão de saldo (ARIMA/Prophet)

---

## 🎨 UI/UX - Padrões Modernos 2025

### Design System
- **Framework**: MUI v6 + Tailwind CSS
- **Tema**: Dark mode nativo + light mode
- **Cores**: Sistema de design tokens
- **Tipografia**: Inter / Geist Sans
- **Ícones**: Lucide React + Material Icons

### Componentes Reutilizáveis
- [ ] DataGrid avançado (ag-Grid ou MUI X Data Grid Pro)
- [ ] Filtros complexos (range, multi-select)
- [ ] Upload com preview (drag-and-drop)
- [ ] Stepper para workflows
- [ ] Signature pad
- [ ] Kanban board (react-beautiful-dnd)
- [ ] Timeline (histórico)

### UX Best Practices
- Loading states (Skeleton)
- Empty states (ilustrações)
- Error boundaries
- Toast notifications (react-hot-toast)
- Confirmações (modals)
- Keyboard shortcuts
- Responsive (mobile-first)

---

## 🗓️ Cronograma de Entrega

| Semana | Módulo | Entregáveis |
|--------|--------|-------------|
| 1 | OS + Anexos | CRUD OS, Upload, Workflow |
| 2 | Documentos Fiscais | Upload CTe, OCR, Validação |
| 3 | Pneus Avançado | Recapagens, Custo/KM, Alertas |
| 4 | AI Hub | Chat multi-IA, RAG, Especialistas |
| 5 | Preditiva | Modelos ML, Previsões |
| 6 | Roteirização | OR-Tools, Multi-depot |
| 7 | Extratos | Import OFX, Categorização |
| 8 | Developer Module | Workflow builder, API playground |

---

## 📚 Referências e Inspirações

### Sistemas de Referência
- **Gestran** - https://www.gestran.com.br/gestao-de-frotas/pneus
- **Lincros** - https://lincros.com/acompanhamento-de-entregas
- **Fusion** - Roteirização avançada
- **Totvs** - ERP features
- **Odoo** - Developer module
- **Samsara** - IoT fleet management

### Tecnologias
- Next.js 14 (App Router)
- MUI v6
- Azure Database for PostgreSQL
- Azure Static Web Apps (deploy)
- Azure OpenAI (IA)
- Google OR-Tools (roteirização)
- TensorFlow.js (ML)

---

**Autor**: GitHub Copilot  
**Data**: 28/10/2025  
**Versão**: 1.0
