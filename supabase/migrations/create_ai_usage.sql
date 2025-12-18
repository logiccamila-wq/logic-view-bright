create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text,
  task text,
  tokens_in int,
  tokens_out int,
  cost_usd numeric(10,4),
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_usage' and policyname = 'ai_usage_select_own'
  ) then
    create policy ai_usage_select_own on public.ai_usage for select using (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'ai_usage' and policyname = 'ai_usage_insert_service'
  ) then
    create policy ai_usage_insert_service on public.ai_usage for insert with check (true);
  end if;
end $$;
