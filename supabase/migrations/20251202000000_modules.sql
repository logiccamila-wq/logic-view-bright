create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  description text,
  enabled boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists public.module_settings (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null references public.modules(slug) on delete cascade,
  key text not null,
  value jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists public.module_usage (
  id uuid primary key default gen_random_uuid(),
  module_slug text not null references public.modules(slug) on delete cascade,
  user_id uuid,
  action text,
  meta jsonb,
  created_at timestamp with time zone default now()
);
