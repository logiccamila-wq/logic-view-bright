-- Permite motoristas (pilotos) criarem e atualizarem suas próprias viagens
-- Mantém políticas existentes para gestores

-- Função auxiliar para verificar se o driver_id pertence ao usuário autenticado
create or replace function public.is_driver_owner(_driver_id uuid)
returns boolean
security definer
stable
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.drivers d
    join public.employees e on e.id = d.employee_id
    where d.id = _driver_id
      and e.user_id = auth.uid()
  );
$$ language sql;

-- Motoristas podem inserir viagens para si mesmos
create policy if not exists "Motoristas podem criar suas viagens"
on public.driver_trips
for insert
with check (
  public.is_driver_owner(driver_id)
);

-- Motoristas podem atualizar viagens próprias
create policy if not exists "Motoristas podem atualizar suas viagens"
on public.driver_trips
for update
using (
  public.is_driver_owner(driver_id)
)
with check (
  public.is_driver_owner(driver_id)
);
