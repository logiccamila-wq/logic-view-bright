create table if not exists public.ehs_incidents (
  id uuid primary key default gen_random_uuid(),
  vehicle_plate text,
  product text,
  severity int,
  description text,
  occurred_at timestamptz,
  location jsonb,
  actions jsonb,
  status text default 'open',
  created_by uuid,
  created_at timestamptz default now(),
  resolved_at timestamptz
);

create table if not exists public.ehs_training_records (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid,
  training_type text,
  certificate_id text,
  issue_date date,
  expiry_date date,
  status text default 'valid',
  created_at timestamptz default now()
);

create table if not exists public.ehs_chemical_manifests (
  id uuid primary key default gen_random_uuid(),
  product text not null,
  un_number text,
  risk_class text,
  fds_url text,
  nbr7503_url text,
  notes text,
  created_at timestamptz default now()
);

create table if not exists public.ehs_audits (
  id uuid primary key default gen_random_uuid(),
  module text,
  checklist jsonb,
  result text,
  performed_by uuid,
  performed_at timestamptz default now()
);

alter table public.ehs_incidents enable row level security;
alter table public.ehs_training_records enable row level security;
alter table public.ehs_chemical_manifests enable row level security;
alter table public.ehs_audits enable row level security;

create policy ehs_incidents_select on public.ehs_incidents for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid()) or public.has_role('fleet_maintenance', auth.uid())
);
create policy ehs_incidents_modify on public.ehs_incidents for all using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

create policy ehs_training_select on public.ehs_training_records for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy ehs_training_modify on public.ehs_training_records for all using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid())
);

create policy ehs_manifest_select on public.ehs_chemical_manifests for select using (
  true
);
create policy ehs_manifest_modify on public.ehs_chemical_manifests for all using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid())
);

create policy ehs_audits_select on public.ehs_audits for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
create policy ehs_audits_insert on public.ehs_audits for insert with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

