create policy "Managers can read all availability" on public.availability
  for select using (
    exists (
      select 1 from public.employees e
      where e.id = auth.uid() and e.role = 'manager'
    )
  );
