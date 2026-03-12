create table if not exists public.pneus (
  id uuid primary key default gen_random_uuid(),
  codigo text not null,
  marca text not null,
  modelo text not null,
  medida text not null,
  tipo text not null,
  status text not null default 'estoque',
  vehicle_plate text,
  posicao text,
  km_instalacao int,
  km_atual int,
  vida_util_km int,
  profundidade_sulco numeric,
  pressao_recomendada numeric,
  fornecedor text,
  valor_compra numeric,
  data_compra timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.movimentacao_pneus (
  id uuid primary key default gen_random_uuid(),
  pneu_id uuid not null references public.pneus(id) on delete cascade,
  tipo_movimentacao text not null,
  vehicle_plate_origem text,
  vehicle_plate_destino text,
  posicao_origem text,
  posicao_destino text,
  km_veiculo int,
  motivo text not null,
  observacoes text,
  responsavel_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.lavagens (
  id uuid primary key default gen_random_uuid(),
  vehicle_plate text not null,
  tipo_lavagem text not null,
  km int not null,
  foto_antes text,
  foto_depois text,
  responsavel_id uuid,
  status text not null default 'agendada',
  observacoes text,
  valor numeric,
  data_agendada timestamptz,
  data_inicio timestamptz,
  data_conclusao timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.pneus enable row level security;
alter table public.movimentacao_pneus enable row level security;
alter table public.lavagens enable row level security;

drop policy if exists pneus_read on public.pneus;
create policy pneus_read on public.pneus for select using (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_manager')
);
drop policy if exists pneus_write on public.pneus;
create policy pneus_write on public.pneus for all using (
  public.has_role('admin') or public.has_role('maintenance_manager')
) with check (
  public.has_role('admin') or public.has_role('maintenance_manager')
);

drop policy if exists mov_read on public.movimentacao_pneus;
create policy mov_read on public.movimentacao_pneus for select using (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_manager')
);
drop policy if exists mov_write on public.movimentacao_pneus;
create policy mov_write on public.movimentacao_pneus for all using (
  public.has_role('admin') or public.has_role('maintenance_manager')
) with check (
  public.has_role('admin') or public.has_role('maintenance_manager')
);

drop policy if exists wash_read on public.lavagens;
create policy wash_read on public.lavagens for select using (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_manager')
);
drop policy if exists wash_write on public.lavagens;
create policy wash_write on public.lavagens for all using (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_assistant')
) with check (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_assistant')
);

