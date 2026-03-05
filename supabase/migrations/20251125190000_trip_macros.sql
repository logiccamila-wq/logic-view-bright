create table if not exists public.trip_macros (
  id uuid primary key default gen_random_uuid(),
  driver_id uuid not null,
  trip_id uuid,
  macro_type text not null,
  notes text,
  timestamp timestamptz default now()
);

alter table public.trip_macros enable row level security;
create policy tm_select on public.trip_macros for select using (
  public.is_admin(auth.uid()) or auth.uid() = driver_id or public.has_role('operations', auth.uid())
);
create policy tm_insert on public.trip_macros for insert with check (
  auth.uid() = driver_id or public.is_admin(auth.uid())
);

create or replace function public.after_trip_macro_update_sessions()
returns trigger language plpgsql as $$
begin
  if NEW.macro_type = 'INICIO_VIAGEM' then
    insert into public.driver_work_sessions(id, driver_id, vehicle_plate, start_time, km_start)
    values (gen_random_uuid(), NEW.driver_id, (select vehicle_plate from public.trips where id = NEW.trip_id limit 1), NEW.timestamp, null);
  elsif NEW.macro_type = 'FIM_VIAGEM' then
    update public.driver_work_sessions set end_time = NEW.timestamp
    where driver_id = NEW.driver_id and end_time is null;
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_trip_macro_sessions on public.trip_macros;
create trigger trg_trip_macro_sessions after insert on public.trip_macros
for each row execute function public.after_trip_macro_update_sessions();

