-- Migration: create pneus table with additional fields for depth, life, repair
-- Adjust date/time as needed

create table if not exists public.pneus (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  tipo text not null check (tipo in ('novo','recapado','usado')),
  marca text not null,
  modelo text not null,
  medida text not null,
  pressao_recomendada numeric(6,2),
  fornecedor text,
  valor_compra numeric(12,2),
  data_compra timestamptz default now(),
  sulco_inicial_mm numeric(5,2),
  vida_atual integer check (vida_atual in (1,2,3)),
  possui_concerto boolean default false,
  created_at timestamptz default now(),
  created_by uuid default auth.uid()
);

-- RLS
alter table public.pneus enable row level security;

drop policy if exists "pneus_all_authenticated" on public.pneus;
create policy "pneus_all_authenticated" on public.pneus for all to authenticated using (true) with check (true);

-- Index for quick lookups by codigo
create unique index if not exists pneus_codigo_idx on public.pneus (codigo);
