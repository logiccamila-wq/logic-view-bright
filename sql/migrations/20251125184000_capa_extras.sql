alter table public.capa_records add column if not exists attachments jsonb;
alter table public.capa_records add column if not exists signature_base64 text;

alter table public.process_actions add column if not exists cpk numeric;
alter table public.process_actions add column if not exists financial_entry_id uuid;

create or replace function public.after_process_actions_finance_audit()
returns trigger language plpgsql as $$
begin
  if NEW.financial_entry_id is not null and NEW.financial_entry_id is distinct from OLD.financial_entry_id then
    perform public.log_audit('process_action', NEW.id::text, 'finance_link', coalesce(NEW.authorized_by, NEW.created_by), jsonb_build_object('financial_entry_id', NEW.financial_entry_id));
  end if;
  return NEW;
end;$$;

drop trigger if exists trg_pa_finance_audit on public.process_actions;
create trigger trg_pa_finance_audit after update on public.process_actions
for each row execute function public.after_process_actions_finance_audit();

