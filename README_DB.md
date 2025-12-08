# OptiLog - Sistema de Gestão Logística

## Configuração do Banco de Dados (Supabase)

Para garantir o funcionamento correto do sistema, siga os passos abaixo para configurar o banco de dados no Supabase:

### 1. Criar Tabelas (Schema)
Execute o script `database_setup.sql` no Editor SQL do Supabase.
Isso criará todas as tabelas necessárias (service_orders, vehicles, drivers, inventory, etc.) e configurará as políticas de segurança (RLS).

### 2. Popular Dados Iniciais (Seed)
Execute o script `seed.sql` no Editor SQL do Supabase.
Isso inserirá dados de exemplo para veículos, motoristas, ordens de serviço e estoque, permitindo que você teste o sistema imediatamente sem ver telas vazias.

## Funcionalidades Principais

- **Gestão de Frota**: Cadastro de veículos, controle de manutenção, pneus.
- **Monitoramento**: Rastreamento em tempo real, alertas de custo e manutenção.
- **Estoque**: Controle de peças, solicitações e movimentações.
- **Financeiro**: Contas a pagar/receber, DRE, fluxo de caixa.
- **RH/DP**: Cadastro de motoristas, folha de pagamento, controle de jornada.

## Desenvolvimento

Para rodar o projeto localmente:

```bash
npm install
npm run dev
```

## Solução de Problemas Comuns

- **Erro "relation does not exist"**: Certifique-se de ter rodado o `database_setup.sql`.
- **Telas vazias**: Rode o `seed.sql` para ter dados de teste.
- **Erro de permissão**: Verifique se seu usuário tem a `role` correta na tabela `user_roles`. O script de seed cria um admin padrão.
