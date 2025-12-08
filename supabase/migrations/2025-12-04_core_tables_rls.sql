create type app_role as enum (
  'admin',
  'driver',
  'finance',
  'operations',
  'commercial',
  'fleet_maintenance',
  'maintenance_assistant',
  'logistics_manager',
  'maintenance_manager',
  'super_consultant'
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz default now(),
  primary key (user_id, role)
);

create or replace function public.has_role(r app_role)
returns boolean language sql stable as $$
select exists(select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = r);
$$;

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  plate text unique not null,
  brand text,
  model text,
  year int,
  status text,
  mileage int default 0,
  last_service_km int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null references auth.users(id) on delete set null,
  vehicle_plate text references public.vehicles(plate) on delete set null,
  origin text,
  destination text,
  status text,
  created_at timestamptz default now()
);

create table if not exists public.trip_macros (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  driver_id uuid not null references auth.users(id) on delete set null,
  macro_type text not null,
  timestamp timestamptz default now()
);

create table if not exists public.cte (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete set null,
  status text,
  value numeric,
  created_at timestamptz default now()
);

create table if not exists public.refuelings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete set null,
  driver_id uuid references auth.users(id) on delete set null,
  vehicle_plate text,
  km int,
  liters numeric,
  total_value numeric,
  created_at timestamptz default now()
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  type text,
  status text,
  scheduled_for timestamptz,
  cost numeric,
  mechanic_id uuid references auth.users(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.gate_events (
  id uuid primary key default gen_random_uuid(),
  plate text,
  driver text,
  kind text,
  ts timestamptz default now()
);

create table if not exists public.finance_ledgers (
  id uuid primary key default gen_random_uuid(),
  type text,
  amount numeric,
  trip_id uuid,
  created_at timestamptz default now()
);

create table if not exists public.non_conformities (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid references public.vehicles(id) on delete set null,
  rpn int,
  status text,
  created_at timestamptz default now()
);

alter table public.user_roles enable row level security;
alter table public.vehicles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_macros enable row level security;
alter table public.cte enable row level security;
alter table public.refuelings enable row level security;
alter table public.service_orders enable row level security;
alter table public.gate_events enable row level security;
alter table public.finance_ledgers enable row level security;
alter table public.non_conformities enable row level security;

drop policy if exists select_own_roles on public.user_roles;
create policy select_own_roles on public.user_roles for select using (user_id = auth.uid() or public.has_role('admin'));
drop policy if exists admin_manage_roles on public.user_roles;
create policy admin_manage_roles on public.user_roles for all using (public.has_role('admin')) with check (public.has_role('admin'));

drop policy if exists vehicles_read on public.vehicles;
create policy vehicles_read on public.vehicles for select using (
  public.has_role('admin') or public.has_role('operations') or public.has_role('fleet_maintenance')
);
drop policy if exists vehicles_write on public.vehicles;
create policy vehicles_write on public.vehicles for all using (
  public.has_role('admin') or public.has_role('fleet_maintenance')
) with check (
  public.has_role('admin') or public.has_role('fleet_maintenance')
);

drop policy if exists trips_read on public.trips;
create policy trips_read on public.trips for select using (
  driver_id = auth.uid() or public.has_role('admin') or public.has_role('operations')
);
drop policy if exists trips_insert on public.trips;
create policy trips_insert on public.trips for insert with check (
  public.has_role('admin') or driver_id = auth.uid()
);
drop policy if exists trips_update on public.trips;
create policy trips_update on public.trips for update using (
  public.has_role('admin') or driver_id = auth.uid()
) with check (
  public.has_role('admin') or driver_id = auth.uid()
);

drop policy if exists trip_macros_read on public.trip_macros;
create policy trip_macros_read on public.trip_macros for select using (driver_id = auth.uid() or public.has_role('admin'));
drop policy if exists trip_macros_insert on public.trip_macros;
create policy trip_macros_insert on public.trip_macros for insert with check (driver_id = auth.uid() or public.has_role('admin'));

drop policy if exists cte_read on public.cte;
create policy cte_read on public.cte for select using (public.has_role('admin') or public.has_role('operations'));
drop policy if exists cte_write on public.cte;
create policy cte_write on public.cte for all using (public.has_role('admin')) with check (public.has_role('admin'));

drop policy if exists refuelings_read on public.refuelings;
create policy refuelings_read on public.refuelings for select using (
  driver_id = auth.uid() or public.has_role('admin') or public.has_role('finance')
);
drop policy if exists refuelings_insert on public.refuelings;
create policy refuelings_insert on public.refuelings for insert with check (driver_id = auth.uid() or public.has_role('admin'));

drop policy if exists service_orders_read on public.service_orders;
create policy service_orders_read on public.service_orders for select using (
  public.has_role('admin') or public.has_role('operations') or public.has_role('fleet_maintenance')
);
drop policy if exists service_orders_write on public.service_orders;
create policy service_orders_write on public.service_orders for all using (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_assistant')
) with check (
  public.has_role('admin') or public.has_role('fleet_maintenance') or public.has_role('maintenance_assistant')
);

drop policy if exists gate_events_read on public.gate_events;
create policy gate_events_read on public.gate_events for select using (
  public.has_role('admin') or public.has_role('operations') or public.has_role('fleet_maintenance')
);
drop policy if exists gate_events_insert on public.gate_events;
create policy gate_events_insert on public.gate_events for insert with check (
  public.has_role('admin') or public.has_role('operations')
);

drop policy if exists finance_ledgers_read on public.finance_ledgers;
create policy finance_ledgers_read on public.finance_ledgers for select using (
  public.has_role('admin') or public.has_role('finance')
);
drop policy if exists finance_ledgers_write on public.finance_ledgers;
create policy finance_ledgers_write on public.finance_ledgers for all using (
  public.has_role('admin') or public.has_role('finance')
) with check (
  public.has_role('admin') or public.has_role('finance')
);

drop policy if exists nc_read on public.non_conformities;
create policy nc_read on public.non_conformities for select using (
  public.has_role('admin') or public.has_role('operations') or public.has_role('fleet_maintenance')
);
drop policy if exists nc_write on public.non_conformities;
create policy nc_write on public.non_conformities for all using (
  public.has_role('admin') or public.has_role('fleet_maintenance')
) with check (
  public.has_role('admin') or public.has_role('fleet_maintenance')
);
