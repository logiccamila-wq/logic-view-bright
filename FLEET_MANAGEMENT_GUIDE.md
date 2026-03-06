# 🚚 Guia Completo do Sistema de Gestão de Frota

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Módulos Principais](#módulos-principais)
4. [Instalação](#instalação)
5. [Configuração](#configuração)
6. [Uso](#uso)
7. [APIs](#apis)
8. [Integração Google Drive](#integração-google-drive)
9. [IA/ML](#iaml)
10. [FAQ](#faq)

---

## 🎯 Visão Geral

O Sistema de Gestão de Frota do OPTILOG é uma solução completa para gerenciar equipamentos de transporte (semi-reboques, carretas, dollys, containers) com foco em:

- ✅ **Cadastro completo de equipamentos**
- ✅ **Sistema de inspeções** com itens verificados em JSONB
- ✅ **Alertas inteligentes** para vencimentos e não conformidades
- ✅ **Dashboard executivo** com KPIs em tempo real
- ✅ **Integração com Google Drive** para importar planilhas
- ✅ **IA/ML** para previsão de manutenção e otimização

### Principais Funcionalidades

1. **Gestão de Equipamentos**
   - Cadastro de semi-reboques, carretas, dollys, containers
   - Controle de documentação (CRLV, Seguro, ANTT)
   - Rastreamento de localização e status
   - Histórico completo de manutenções

2. **Sistema de Inspeções**
   - Inspeções preventivas, periódicas, anuais
   - Checklist personalizável em JSONB
   - Registro fotográfico
   - Não conformidades críticas
   - Próxima inspeção automática

3. **Alertas Inteligentes**
   - Vencimento de inspeções (7, 30 dias, vencida)
   - Documentos vencidos (CRLV, Seguro)
   - Não conformidades críticas
   - Notificações para gerentes e diretoria
   - Email, SMS e Push notifications

4. **Dashboard Executivo**
   - Total de equipamentos e status
   - Taxa de conformidade
   - Inspeções vencidas e próximas
   - Não conformidades críticas
   - Gráficos e métricas em tempo real

---

## 🏗️ Arquitetura

### Stack Tecnológica

```
┌─────────────────────────────────────────────┐
│            Frontend (Next.js 14)            │
│   ┌─────────────┬─────────────┬──────────┐ │
│   │ Equipamentos│  Inspeções  │  Alertas │ │
│   └─────────────┴─────────────┴──────────┘ │
└─────────────────────┬───────────────────────┘
                      │ REST API
┌─────────────────────┴───────────────────────┐
│         Backend (Node.js + Express)         │
│   ┌─────────────┬─────────────┬──────────┐ │
│   │    /api/    │    /api/    │   /api/  │ │
│   │equipamentos │  inspecoes  │ alertas  │ │
│   └─────────────┴─────────────┴──────────┘ │
└─────────────────────┬───────────────────────┘
                      │
┌─────────────────────┴───────────────────────┐
│      Database (Azure Database for PostgreSQL)         │
│   ┌──────────────────────────────────────┐ │
│   │  equipamentos_frota                  │ │
│   │  inspecoes_equipamentos              │ │
│   │  alertas_inspecoes                   │ │
│   └──────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Estrutura de Dados

#### Equipamentos da Frota
```typescript
interface Equipamento {
  id: number;
  tipo: 'semi-reboque' | 'carreta' | 'dolly' | 'container';
  placa: string;
  chassi: string;
  ano_fabricacao: number;
  fabricante: string;
  modelo: string;
  capacidade_carga: number; // toneladas
  eixos: number;
  proprietario: 'proprio' | 'agregado' | 'terceiro';
  status: 'ativo' | 'manutencao' | 'inativo' | 'vendido';
  localizado_em: string;
  crlv_vencimento?: Date;
  seguro_vencimento?: Date;
  observacoes?: string;
}
```

#### Inspeções
```typescript
interface Inspecao {
  id: number;
  equipamento_id: number;
  tipo_inspecao: 'preventiva' | 'periodica' | 'anual' | 'pre_viagem';
  data_inspecao: Date;
  proxima_inspecao?: Date;
  realizada_por_nome: string;
  status: 'conforme' | 'nao_conforme' | 'pendente';
  
  // Itens verificados em JSONB
  itens_verificados: {
    [key: string]: {
      status: 'ok' | 'atencao' | 'nao_conforme';
      observacao: string;
    };
  };
  
  nao_conformidades: number;
  nao_conformidades_criticas: number;
  observacoes?: string;
  fotos?: string[];
}
```

#### Alertas
```typescript
interface Alerta {
  id: number;
  equipamento_id: number;
  inspecao_id?: number;
  tipo_alerta: 'vencimento_proximo' | 'vencido' | 'nao_conforme_critica';
  severidade: 'info' | 'aviso' | 'critico';
  mensagem: string;
  notificar_gerentes: boolean;
  notificar_diretoria: boolean;
  resolvido: boolean;
  created_at: Date;
}
```

---

## 📦 Módulos Principais

### 1. Cadastro de Equipamentos

**Localização**: `/app/frota/gestao/equipamentos`

**Funcionalidades**:
- Cadastro completo com todos os dados do equipamento
- Upload de fotos
- Histórico de manutenções
- Filtros por tipo, status, proprietário
- Exportação para Excel/PDF

**APIs**:
```
GET    /api/equipamentos          # Listar todos
GET    /api/equipamentos/:id      # Buscar por ID
POST   /api/equipamentos          # Criar novo
PUT    /api/equipamentos/:id      # Atualizar
DELETE /api/equipamentos/:id      # Deletar
GET    /api/equipamentos/stats/dashboard  # Estatísticas
```

### 2. Sistema de Inspeções

**Localização**: `/app/frota/gestao/inspecoes`

**Funcionalidades**:
- Criar inspeção com checklist personalizável
- Registro de não conformidades
- Upload de fotos
- Cálculo automático da próxima inspeção
- Geração de laudos em PDF

**Itens Verificados (Padrão)**:
- Pneus
- Freios
- Suspensão
- Sistema elétrico
- Estrutura/Chassi
- Engate
- Portas/Travas

**APIs**:
```
GET    /api/inspecoes             # Listar todas
GET    /api/inspecoes/:id         # Buscar por ID
POST   /api/inspecoes             # Criar nova
PUT    /api/inspecoes/:id         # Atualizar
DELETE /api/inspecoes/:id         # Deletar
GET    /api/inspecoes/equipamento/:id/historico  # Histórico
POST   /api/inspecoes/check-vencimentos  # Verificar vencimentos
```

### 3. Sistema de Alertas

**Localização**: Dashboard integrado

**Funcionalidades**:
- Alertas automáticos por regras de negócio
- Notificações por email, SMS, push
- Resolução de alertas com notas
- Dashboard de alertas ativos

**Regras de Negócio**:

| Condição | Severidade | Notificação | Ação |
|----------|------------|-------------|------|
| Inspeção vencida | CRÍTICO | Gerente + Diretor | Bloqueia equipamento |
| Vencimento em 7 dias | AVISO | Gerente | Notifica |
| Vencimento em 30 dias | INFO | Gerente | Notifica |
| Não conformidade crítica | CRÍTICO | Gerente + Diretor | Bloqueia + OS |

**APIs**:
```
GET    /api/alertas-inspecoes         # Listar todos
GET    /api/alertas-inspecoes/:id     # Buscar por ID
POST   /api/alertas-inspecoes         # Criar novo
PUT    /api/alertas-inspecoes/:id/resolver  # Resolver
GET    /api/alertas-inspecoes/pendentes/notificacao  # Pendentes
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js >= 18.0.0
- PostgreSQL (ou conta no Azure PostgreSQL)
- Git

### Passo a Passo

1. **Clone o repositório**:
```bash
git clone https://github.com/logiccamila-wq/optilog.app.git
cd optilog.app
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure o banco de dados**:

Crie um arquivo `.env.local` na raiz do projeto:
```env
DATABASE_URL=postgres://user:password@host:5432/database?sslmode=require
```

4. **Execute as migrações**:
```bash
node backend/scripts/apply_sql_files.mjs backend/scripts/create_fleet_inspections_tables.sql
```

5. **Inicie o servidor de desenvolvimento**:
```bash
# Frontend
npm run dev

# Backend
npm run api
```

6. **Acesse a aplicação**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgres://user:pass@host/db?sslmode=require

# Backend
PORT=3001
CORS_ORIGIN=http://localhost:3000,https://optilog.app

# Notificações (Opcional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha

# SMS (Opcional)
TWILIO_ACCOUNT_SID=seu-sid
TWILIO_AUTH_TOKEN=seu-token
TWILIO_PHONE_NUMBER=+5511999999999

# Google Drive (Opcional)
GOOGLE_DRIVE_API_KEY=sua-chave
GOOGLE_DRIVE_FOLDER_ID=1MktGmYHsozSnUZmTOQVc3PFpXyo4G7JQ
```

---

## 💻 Uso

### 1. Cadastrar Equipamento

1. Acesse **Frota > Gestão > Equipamentos**
2. Clique em **+ Novo Equipamento**
3. Preencha os dados:
   - Tipo (semi-reboque, carreta, dolly)
   - Placa e Chassi
   - Fabricante e Modelo
   - Ano de fabricação
   - Capacidade de carga
   - Proprietário
   - Status e localização
4. Clique em **Salvar**

### 2. Realizar Inspeção

1. Acesse **Frota > Gestão > Inspeções**
2. Clique em **+ Nova Inspeção**
3. Selecione o equipamento
4. Escolha o tipo de inspeção
5. Preencha o checklist de itens:
   - Para cada item, selecione: OK, Atenção ou Não Conforme
   - Adicione observações se necessário
6. Defina a data da próxima inspeção
7. Clique em **Salvar Inspeção**

**Sistema Automático**:
- Se houver não conformidades críticas, um alerta CRÍTICO é criado automaticamente
- O equipamento pode ser bloqueado para uso
- Gerentes e diretoria são notificados

### 3. Gerenciar Alertas

1. Acesse o **Dashboard de Gestão**
2. Visualize alertas na seção "Alertas Ativos"
3. Clique em um alerta para ver detalhes
4. Para resolver:
   - Clique em "Resolver"
   - Adicione notas de resolução
   - Confirme

### 4. Verificar Vencimentos

**Automático via Cron** (Recomendado):
```bash
# Adicione ao crontab para rodar diariamente às 8h
0 8 * * * curl -X POST http://localhost:3001/api/inspecoes/check-vencimentos
```

**Manual via API**:
```bash
curl -X POST http://localhost:3001/api/inspecoes/check-vencimentos
```

---

## 📊 APIs

### Estatísticas do Dashboard

**GET `/api/equipamentos/stats/dashboard`**

Resposta:
```json
{
  "equipamentos": {
    "total_equipamentos": 50,
    "equipamentos_ativos": 45,
    "em_manutencao": 3,
    "inativos": 2
  },
  "inspecoes": {
    "vencidas": 2,
    "vencendo_7dias": 5,
    "vencendo_30dias": 10
  },
  "alertas": {
    "criticos": 2,
    "avisos": 5,
    "info": 10
  },
  "conformidade": {
    "conformes": 42,
    "nao_conformes": 3,
    "total": 45,
    "taxa_conformidade": 93.3
  }
}
```

### Exemplo Completo de Uso

**1. Criar Equipamento**:
```javascript
const equipamento = await fetch('/api/equipamentos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tipo: 'semi-reboque',
    placa: 'ABC1234',
    chassi: '9BW123456789012345',
    ano_fabricacao: 2020,
    fabricante: 'Randon',
    modelo: 'R-460',
    capacidade_carga: 30.0,
    eixos: 3,
    proprietario: 'proprio',
    status: 'ativo',
    localizado_em: 'garagem'
  })
});
```

**2. Criar Inspeção**:
```javascript
const inspecao = await fetch('/api/inspecoes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    equipamento_id: 1,
    tipo_inspecao: 'preventiva',
    data_inspecao: '2025-10-29',
    proxima_inspecao: '2026-04-29',
    realizada_por_nome: 'João Silva',
    itens_verificados: {
      pneus: { status: 'ok', observacao: '' },
      freios: { status: 'ok', observacao: '' },
      suspensao: { status: 'ok', observacao: '' },
      sistema_eletrico: { status: 'ok', observacao: '' },
      estrutura_chassi: { status: 'nao_conforme', observacao: 'Rachadura detectada' }
    },
    observacoes: 'Necessário reparo no chassi'
  })
});
```

---

## 📁 Integração Google Drive

### Configuração

1. **Crie um projeto no Google Cloud Console**
2. **Ative a Google Drive API**
3. **Crie credenciais OAuth 2.0**
4. **Configure a URL de callback**: `https://optilog.app/api/google-drive/callback`
5. **Adicione as variáveis no `.env.local`**:

```env
GOOGLE_DRIVE_CLIENT_ID=seu-client-id
GOOGLE_DRIVE_CLIENT_SECRET=seu-client-secret
GOOGLE_DRIVE_REDIRECT_URI=https://optilog.app/api/google-drive/callback
GOOGLE_DRIVE_FOLDER_ID=1MktGmYHsozSnUZmTOQVc3PFpXyo4G7JQ
```

### Importar Planilhas

1. Coloque planilhas na pasta do Google Drive (link no problema_statement)
2. Acesse **Inspeções > Importar do Google Drive**
3. Selecione o arquivo para importar
4. O sistema faz parse automático e cria:
   - Equipamentos (se não existirem)
   - Inspeções com dados da planilha
   - Alertas se necessário

### Formato da Planilha

| Placa | Tipo | Data Inspeção | Próxima | Tipo Inspeção | Status | Itens OK | Itens Atenção | Itens NC |
|-------|------|---------------|---------|---------------|--------|----------|---------------|----------|
| ABC1234 | Semi-reboque | 2025-10-20 | 2026-04-20 | Preventiva | Conforme | Pneus, Freios | - | - |
| DEF5678 | Carreta | 2025-10-15 | 2026-04-15 | Periódica | Não Conforme | Pneus | Freios | Chassi |

---

## 🤖 IA/ML

### Módulos Planejados

#### 1. Previsão de Manutenção
- Analisa histórico de inspeções
- Identifica padrões de falhas
- Prevê necessidade de manutenção com 30-60 dias de antecedência
- Sugere ações preventivas

#### 2. Otimização de Custos
- Análise de custo por equipamento
- Identifica equipamentos "problema"
- Sugere substituição ou venda
- Calcula ROI de cada ativo

#### 3. Score de Risco
- Calcula risco de acidentes por equipamento
- Baseado em: idade, km rodados, histórico de não conformidades
- Alerta proativo para equipamentos de alto risco

#### 4. Análise de Conformidade
- Taxa de conformidade por equipamento
- Identifica itens críticos recorrentes
- Benchmarking com frota completa
- Sugere melhorias

---

## ❓ FAQ

### Como adiciono um novo tipo de inspeção?

Edite o enum no arquivo SQL:
```sql
ALTER TABLE inspecoes_equipamentos 
  ALTER COLUMN tipo_inspecao TYPE VARCHAR(50);
```

### Como personalizo os itens verificados?

Os itens são armazenados em JSONB, então você pode adicionar novos campos dinamicamente no frontend sem alterar o banco.

### Como configuro notificações por email?

Configure as variáveis SMTP no `.env.local` e implemente o módulo de email em `backend/services/email.js`.

### Posso usar SQLite ao invés de PostgreSQL?

Não. O sistema usa recursos específicos do PostgreSQL como JSONB e funções PL/pgSQL.

### Como faço backup dos dados?

```bash
pg_dump $DATABASE_URL > backup.sql
```

### Como restauro um backup?

```bash
psql $DATABASE_URL < backup.sql
```

---

## 🆘 Suporte

- **Documentação**: [docs.optilog.app](https://docs.optilog.app)
- **Issues**: [GitHub Issues](https://github.com/logiccamila-wq/optilog.app/issues)
- **Email**: contato@camilalareste.com.br
- **Consultoria Premium**: R$ 3.500/mês

---

**Desenvolvido com ❤️ por Camila Lareste**

OPTILOG - O Melhor Sistema de Gestão de Frota do Brasil 🚚💎
