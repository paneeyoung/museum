-- Employees need to update their own locale (language switcher), but must not be able
-- to rewrite their own role/name/email via the same endpoint, so grant UPDATE on just
-- the locale column and scope the RLS policy to the row owner.
revoke update on public.employees from authenticated;
grant update (locale) on public.employees to authenticated;

create policy "Employees can update own locale" on public.employees
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
