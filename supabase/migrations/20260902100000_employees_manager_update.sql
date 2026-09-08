-- Magic-link signup never collects a name, so handle_new_user() falls back to
-- email for full_name. Managers need to be able to correct it after the fact
-- (employees table had no write policies at all until now).
--
-- Row-level only: this doesn't restrict which columns can be changed. The
-- app only ever writes full_name from this policy's call site — same trust
-- model already used for shifts_template/functions elsewhere in this schema.
create policy "Managers can update employees" on public.employees
  for update using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  )
  with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );
