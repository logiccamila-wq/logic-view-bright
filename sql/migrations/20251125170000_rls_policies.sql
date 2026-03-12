alter table public.chat_messages enable row level security;
alter table public.cte enable row level security;

create or replace function public.is_admin(uid uuid)
returns boolean language sql stable as $$
  select exists(
    select 1 from public.user_roles
    where user_id = uid and role = 'admin'
  );
$$;

drop policy if exists chat_messages_select on public.chat_messages;
create policy chat_messages_select on public.chat_messages
for select using (
  sender_id = auth.uid()
  or exists (
    select 1 from public.chat_conversations c
    where c.id = chat_messages.conversation_id and c.user_id = auth.uid()
  )
  or public.is_admin(auth.uid())
);

drop policy if exists chat_messages_insert on public.chat_messages;
create policy chat_messages_insert on public.chat_messages
for insert with check (
  sender_id = auth.uid() or public.is_admin(auth.uid())
);

drop policy if exists cte_select on public.cte;
create policy cte_select on public.cte
for select using (
  created_by = auth.uid() or public.is_admin(auth.uid())
);

drop policy if exists cte_insert on public.cte;
create policy cte_insert on public.cte
for insert with check (
  created_by = auth.uid() or public.is_admin(auth.uid())
);

