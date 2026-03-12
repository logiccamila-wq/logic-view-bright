create table if not exists public.maintenance_irregularities (
  id uuid primary key default gen_random_uuid(),
  vehicle_plate text,
  checklist_item text,
  notes text,
  created_by uuid,
  created_at timestamptz default now()
);

alter table public.maintenance_irregularities enable row level security;
create policy mi_select on public.maintenance_irregularities for select using (
  public.is_admin(auth.uid()) or public.has_role('maintenance_manager', auth.uid()) or public.has_role('fleet_maintenance', auth.uid())
);
create policy mi_insert on public.maintenance_irregularities for insert with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

create or replace function public.after_irregularity_insert_create_os()
returns trigger language plpgsql as $$
begin
  insert into public.service_orders(id, vehicle_plate, description, status, created_at)
  values (gen_random_uuid(), NEW.vehicle_plate, 'Irregularidade: ' || coalesce(NEW.checklist_item,''), 'open', now());
  perform public.log_audit('service_order', NEW.vehicle_plate, 'created_from_checklist', NEW.created_by, jsonb_build_object('irregularity_id', NEW.id));
  return NEW;
end;$$;

drop trigger if exists trg_irregularity_create_os on public.maintenance_irregularities;
create trigger trg_irregularity_create_os after insert on public.maintenance_irregularities
for each row execute function public.after_irregularity_insert_create_os();

