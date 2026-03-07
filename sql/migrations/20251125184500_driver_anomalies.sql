create table if not exists public.driver_anomalies (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid,
  vehicle_plate text,
  trip_id text,
  description text,
  severity int,
  created_at timestamptz default now()
);

alter table public.driver_anomalies enable row level security;
create policy da_select on public.driver_anomalies for select using (
  public.is_admin(auth.uid()) or auth.uid() = driver_id or public.has_role('maintenance_manager', auth.uid())
);
create policy da_insert on public.driver_anomalies for insert with check (
  auth.uid() = driver_id or public.is_admin(auth.uid())
);

create or replace function public.after_driver_anomaly_insert_create_os()
returns trigger language plpgsql as $$
begin
  insert into public.service_orders(id, vehicle_plate, description, status, created_at)
  values (gen_random_uuid(), NEW.vehicle_plate, coalesce(NEW.description,'Anomalia reportada pelo motorista'), 'open', now());
  perform public.log_audit('service_order', NEW.vehicle_plate, 'created_from_anomaly', NEW.driver_id, jsonb_build_object('anomaly_id', NEW.id));
  return NEW;
end;$$;

drop trigger if exists trg_driver_anomaly_create_os on public.driver_anomalies;
create trigger trg_driver_anomaly_create_os after insert on public.driver_anomalies
for each row execute function public.after_driver_anomaly_insert_create_os();

