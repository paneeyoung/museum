-- Inline rename of a function name from the schedule grid needs UPDATE on
-- functions — it only had insert/delete policies (and, per the lesson from
-- employees/roster/roster_shifts, granting the RLS policy alone isn't
-- enough without the base GRANT — adding both here to avoid repeating that
-- bug).
create policy "Managers can update functions" on public.functions
  for update using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  )
  with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

grant update on public.functions to authenticated;
