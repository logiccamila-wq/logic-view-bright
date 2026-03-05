create table if not exists public.function_logs (
  id uuid primary key default gen_random_uuid(),
  correlation_id text,
  function_name text,
  level text,
  message text,
  metadata jsonb,
  created_at timestamptz default now()
);

create table if not exists public.audit_trail (
  id uuid primary key default gen_random_uuid(),
  entity_type text,
  entity_id text,
  action text,
  actor_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

alter table public.function_logs enable row level security;
alter table public.audit_trail enable row level security;

create policy fl_select on public.function_logs for select using (public.is_admin(auth.uid()));
create policy at_select on public.audit_trail for select using (public.is_admin(auth.uid()) or public.has_role('operations', auth.uid()) or public.has_role('maintenance_manager', auth.uid()));

create or replace function public.log_audit(entity_type text, entity_id text, action text, actor uuid, details jsonb)
returns void language sql as $$
  insert into public.audit_trail(id, entity_type, entity_id, action, actor_id, details)
  values (gen_random_uuid(), entity_type, entity_id, action, actor, details);
$$;

create or replace function public.after_process_actions_update_audit()
returns trigger language plpgsql as $$
begin
  if NEW.authorized_by is distinct from OLD.authorized_by and NEW.authorized_by is not null then
    perform public.log_audit('process_action', NEW.id::text, 'authorized', NEW.authorized_by, jsonb_build_object('title', NEW.title));
  end if;
  if NEW.status is distinct from OLD.status then
    perform public.log_audit('process_action', NEW.id::text, 'status_change', coalesce(NEW.authorized_by, NEW.created_by), jsonb_build_object('from', OLD.status, 'to', NEW.status));
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_pa_update_audit on public.process_actions;
create trigger trg_pa_update_audit after update on public.process_actions
for each row execute function public.after_process_actions_update_audit();

create or replace function public.after_capa_update_audit()
returns trigger language plpgsql as $$
begin
  if NEW.authorized_by is distinct from OLD.authorized_by and NEW.authorized_by is not null then
    perform public.log_audit('capa', NEW.id::text, 'authorized', NEW.authorized_by, jsonb_build_object('nc_id', NEW.nc_id));
  end if;
  if NEW.status is distinct from OLD.status then
    perform public.log_audit('capa', NEW.id::text, 'status_change', NEW.authorized_by, jsonb_build_object('from', OLD.status, 'to', NEW.status));
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_capa_update_audit on public.capa_records;
create trigger trg_capa_update_audit after update on public.capa_records
for each row execute function public.after_capa_update_audit();

