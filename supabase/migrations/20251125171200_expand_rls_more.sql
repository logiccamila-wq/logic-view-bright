-- Expandir RLS
alter table public.mdfe enable row level security;
alter table public.driver_work_sessions enable row level security;
alter table public.workshop_inventory enable row level security;
alter table public.pneus enable row level security;
alter table public.movimentacao_pneus enable row level security;
alter table public.revenue_records enable row level security;

-- mdfe: ownership/admin
drop policy if exists mdfe_select on public.mdfe;
create policy mdfe_select on public.mdfe for select using (
  created_by = auth.uid() or public.is_admin(auth.uid())
);
drop policy if exists mdfe_insert on public.mdfe;
create policy mdfe_insert on public.mdfe for insert with check (
  created_by = auth.uid() or public.is_admin(auth.uid())
);

-- driver_work_sessions: driver/admin/fleet_maintenance
drop policy if exists dws_select on public.driver_work_sessions;
create policy dws_select on public.driver_work_sessions for select using (
  driver_id = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid())
);
drop policy if exists dws_insert on public.driver_work_sessions;
create policy dws_insert on public.driver_work_sessions for insert with check (
  driver_id = auth.uid() or public.is_admin(auth.uid())
);
drop policy if exists dws_update on public.driver_work_sessions;
create policy dws_update on public.driver_work_sessions for update using (
  driver_id = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid())
) with check (
  driver_id = auth.uid() or public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid())
);

-- workshop_inventory: admin/maintenance roles
drop policy if exists wi_select on public.workshop_inventory;
create policy wi_select on public.workshop_inventory for select using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
drop policy if exists wi_modify on public.workshop_inventory;
create policy wi_modify on public.workshop_inventory for all using (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

-- pneus e movimentação: admin/maintenance roles
drop policy if exists pneus_select on public.pneus;
create policy pneus_select on public.pneus for select using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
drop policy if exists pneus_modify on public.pneus;
create policy pneus_modify on public.pneus for all using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

drop policy if exists mov_pneus_select on public.movimentacao_pneus;
create policy mov_pneus_select on public.movimentacao_pneus for select using (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);
drop policy if exists mov_pneus_insert on public.movimentacao_pneus;
create policy mov_pneus_insert on public.movimentacao_pneus for insert with check (
  public.is_admin(auth.uid()) or public.has_role('fleet_maintenance', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

-- revenue_records: ownership/admin/finance
drop policy if exists rr_select on public.revenue_records;
create policy rr_select on public.revenue_records for select using (
  created_by = auth.uid() or public.is_admin(auth.uid()) or public.has_role('finance', auth.uid())
);
