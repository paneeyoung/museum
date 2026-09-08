-- roster / roster_shifts only had SELECT policies so far. Auto-plan needs
-- managers to create the week's roster row and write its shift assignments.
create policy "Managers can insert roster" on public.roster
  for insert with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can update roster" on public.roster
  for update using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can insert roster shifts" on public.roster_shifts
  for insert with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can update roster shifts" on public.roster_shifts
  for update using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can delete roster shifts" on public.roster_shifts
  for delete using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );
