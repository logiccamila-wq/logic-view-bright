-- Permit drivers (pilotos) to criar e atualizar suas próprias viagens
-- Mantém políticas existentes para gestores

-- Drivers podem inserir viagens para si mesmos
create policy if not exists "Motoristas podem criar suas viagens"
on public.driver_trips
for insert
with check (
  driver_id in (
    select d.id
    from public.drivers d
    join public.employees e on e.id = d.employee_id
    where e.user_id = auth.uid()
  )
);

-- Drivers podem atualizar viagens próprias
create policy if not exists "Motoristas podem atualizar suas viagens"
on public.driver_trips
for update
using (
  driver_id in (
    select d.id
    from public.drivers d
    join public.employees e on e.id = d.employee_id
    where e.user_id = auth.uid()
  )
)
with check (
  driver_id in (
    select d.id
    from public.drivers d
    join public.employees e on e.id = d.employee_id
    where e.user_id = auth.uid()
  )
);
