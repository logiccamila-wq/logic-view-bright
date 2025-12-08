alter table public.service_orders
  add column if not exists vehicle_plate text,
  add column if not exists vehicle_model text,
  add column if not exists issue_description text,
  add column if not exists odometer int,
  add column if not exists priority text,
  add column if not exists parts_used jsonb,
  add column if not exists labor_hours numeric,
  add column if not exists estimated_completion timestamptz,
  add column if not exists completed_at timestamptz;

alter table public.service_orders
  alter column status set default 'pendente';

