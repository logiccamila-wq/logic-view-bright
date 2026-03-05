-- Adicionar valor ao enum app_role
do $$ begin
  alter type public.app_role add value if not exists 'super_consultant';
exception when others then null;
end $$;

-- Tabela de Apólices de Seguro
create table if not exists public.insurance_policies (
  id uuid primary key default gen_random_uuid(),
  vehicle_plate text not null,
  insurer_name text not null,
  policy_number text not null,
  coverage jsonb,
  issue_date date,
  expiry_date date,
  premium_value numeric,
  status text default 'active',
  created_at timestamptz default now(),
  created_by uuid
);

alter table public.insurance_policies enable row level security;

create policy insurance_select on public.insurance_policies
for select using (
  created_by = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('finance', auth.uid())
);

create policy insurance_insert on public.insurance_policies
for insert with check (
  created_by = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('finance', auth.uid())
);

create policy insurance_update on public.insurance_policies
for update using (
  created_by = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('finance', auth.uid())
) with check (
  created_by = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('finance', auth.uid())
);

