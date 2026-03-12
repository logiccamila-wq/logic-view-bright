-- 20251208221000_create_maintenance_checklists.sql
-- Migration: create maintenance_checklists table
-- Dependencies: vehicles, users

create table if not exists public.maintenance_checklists (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  vehicle_plate text not null references public.vehicles(plate) on delete cascade,
  checklist_type text not null check (checklist_type in ('preventiva','corretiva')),
  items jsonb not null,
  mechanic_id uuid references auth.users(id),
  status text not null default 'em_andamento',
  completed_at timestamp with time zone,
  odometer_km integer,
  authorized_by uuid references auth.users(id),
  entry_at timestamp with time zone,
  exit_at timestamp with time zone
);

-- Indexes to speed up queries
create index if not exists maintenance_checklists_vehicle_plate_idx on public.maintenance_checklists(vehicle_plate);
create index if not exists maintenance_checklists_mechanic_id_idx on public.maintenance_checklists(mechanic_id);
create index if not exists maintenance_checklists_status_idx on public.maintenance_checklists(status);

-- RLS
alter table public.maintenance_checklists enable row level security;

-- Allow owners and mechanics (placeholder – customize later)
create policy "Allow all authenticated" on public.maintenance_checklists
  for select using (auth.role() = 'authenticated');

create policy "Allow insert for authenticated" on public.maintenance_checklists
  for insert with check (auth.role() = 'authenticated');
