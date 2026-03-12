create table if not exists public.process_actions (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  entity_id text,
  vehicle_plate text,
  type text not null,
  title text not null,
  description text,
  status text not null default 'pending',
  priority text default 'medium',
  due_date timestamptz,
  assigned_to uuid,
  created_by uuid,
  authorized_by uuid,
  completed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.process_actions enable row level security;
create policy pa_select on public.process_actions for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid()) or public.has_role('finance', auth.uid())
);
create policy pa_insert on public.process_actions for insert with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy pa_update on public.process_actions for update using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

create table if not exists public.non_conformities (
  id uuid primary key default gen_random_uuid(),
  module text not null,
  vehicle_plate text,
  description text not null,
  severity int not null,
  occurrence int not null,
  detection int not null,
  rpn int generated always as ((severity * occurrence * detection)) stored,
  cause_analysis jsonb,
  actions jsonb,
  status text default 'open',
  created_by uuid,
  resolver_id uuid,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

alter table public.non_conformities enable row level security;
create policy nc_select on public.non_conformities for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid()) or public.has_role('finance', auth.uid())
);
create policy nc_insert on public.non_conformities for insert with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy nc_update on public.non_conformities for update using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

