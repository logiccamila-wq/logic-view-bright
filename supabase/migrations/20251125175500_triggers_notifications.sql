create or replace function public.notify_roles(title text, message text, type text, module text, role_name text)
returns void language plpgsql as $$
declare r record;
begin
  for r in select user_id from public.user_roles where role = role_name loop
    insert into public.notifications (id, user_id, title, message, type, module, read, created_at, updated_at)
    values (gen_random_uuid(), r.user_id, title, message, type, module, false, now(), now());
  end loop;
end;$$;

create or replace function public.after_nc_insert_notify()
returns trigger language plpgsql as $$
begin
  if NEW.rpn >= 200 then
    perform public.notify_roles('NC crítica', 'RPN ' || NEW.rpn || ' em ' || coalesce(NEW.vehicle_plate,'') || ' - ' || NEW.description, 'error', NEW.module, 'maintenance_manager');
    perform public.notify_roles('NC crítica', 'RPN ' || NEW.rpn || ' em ' || coalesce(NEW.vehicle_plate,'') || ' - ' || NEW.description, 'error', NEW.module, 'operations');
  elsif NEW.rpn >= 125 then
    perform public.notify_roles('NC alta', 'RPN ' || NEW.rpn || ' em ' || coalesce(NEW.vehicle_plate,'') || ' - ' || NEW.description, 'warning', NEW.module, 'maintenance_manager');
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_nc_insert_notify on public.non_conformities;
create trigger trg_nc_insert_notify after insert on public.non_conformities
for each row execute function public.after_nc_insert_notify();

create or replace function public.after_action_due_notify()
returns trigger language plpgsql as $$
begin
  if NEW.due_date is not null and NEW.due_date < now() and NEW.status <> 'completed' then
    perform public.notify_roles('Ação atrasada', NEW.title, 'warning', NEW.module, 'operations');
    perform public.notify_roles('Ação atrasada', NEW.title, 'warning', NEW.module, 'maintenance_manager');
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_action_insert_notify on public.process_actions;
create trigger trg_action_insert_notify after insert on public.process_actions
for each row execute function public.after_action_due_notify();

