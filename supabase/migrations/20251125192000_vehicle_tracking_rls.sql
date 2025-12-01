alter table public.vehicle_tracking enable row level security;

drop policy if exists vt_select on public.vehicle_tracking;
create policy vt_select on public.vehicle_tracking
for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('logistics_manager', auth.uid()) or auth.uid() = driver_id
);

drop policy if exists vt_insert on public.vehicle_tracking;
create policy vt_insert on public.vehicle_tracking
for insert with check (
  auth.uid() = driver_id or public.is_admin(auth.uid())
);

