create table if not exists public.vehicle_axle_configs (
  id uuid primary key default gen_random_uuid(),
  vehicle_plate text not null,
  layout text not null,
  axles jsonb not null,
  created_at timestamptz default now(),
  created_by uuid
);

alter table public.vehicle_axle_configs enable row level security;
create policy vac_select on public.vehicle_axle_configs for select using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy vac_modify on public.vehicle_axle_configs for all using (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

create table if not exists public.tire_events (
  id uuid primary key default gen_random_uuid(),
  pneu_id uuid not null,
  event_type text not null,
  timestamp timestamptz default now(),
  vehicle_plate text,
  position text,
  km_vehicle numeric,
  tread_depth_mm numeric,
  pressure_psi numeric,
  temperature_celsius numeric,
  latitude numeric,
  longitude numeric,
  authorized_by uuid,
  cost numeric,
  notes text
);

alter table public.tire_events enable row level security;
create policy te_select on public.tire_events for select using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy te_insert on public.tire_events for insert with check (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

alter table public.pneus add column if not exists life_stage text default 'novo';
alter table public.pneus add column if not exists valor_recape numeric;

create table if not exists public.tire_targets (
  id uuid primary key default gen_random_uuid(),
  vehicle_plate text,
  stage text,
  expected_life_km numeric,
  min_tread_mm numeric,
  alert_threshold_mm numeric,
  created_at timestamptz default now(),
  created_by uuid
);

alter table public.tire_targets enable row level security;
create policy tt_select on public.tire_targets for select using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy tt_modify on public.tire_targets for all using (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

