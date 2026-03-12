create table if not exists public.capa_records (
  id uuid primary key default gen_random_uuid(),
  nc_id uuid references public.non_conformities(id) on delete cascade,
  vehicle_plate text,
  root_cause text,
  actions jsonb,
  due_date timestamptz,
  status text default 'open',
  effectiveness text,
  created_by uuid,
  authorized_by uuid,
  created_at timestamptz default now(),
  closed_at timestamptz
);

alter table public.capa_records enable row level security;
create policy capa_select on public.capa_records for select using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid()) or public.has_role('fleet_maintenance', auth.uid())
);
create policy capa_modify on public.capa_records for all using (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
) with check (
  public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid())
);

create or replace function public.after_capa_insert_notify()
returns trigger language plpgsql as $$
begin
  perform public.notify_roles('CAPA criada', coalesce(NEW.root_cause,'') || ' • vencimento ' || coalesce(NEW.due_date::text,''), 'info', 'operations', 'operations');
  return NEW;
end;$$;

drop trigger if exists trg_capa_insert_notify on public.capa_records;
create trigger trg_capa_insert_notify after insert on public.capa_records
for each row execute function public.after_capa_insert_notify();

create or replace function public.after_capa_update_notify()
returns trigger language plpgsql as $$
begin
  if NEW.due_date is not null and NEW.due_date < now() and NEW.status <> 'closed' then
    perform public.notify_roles('CAPA atrasada', coalesce(NEW.root_cause,'') , 'warning', 'operations', 'operations');
  end if;
  if NEW.status = 'closed' then
    perform public.notify_roles('CAPA encerrada', coalesce(NEW.effectiveness,'') , 'success', 'operations', 'operations');
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_capa_update_notify on public.capa_records;
create trigger trg_capa_update_notify after update on public.capa_records
for each row execute function public.after_capa_update_notify();

