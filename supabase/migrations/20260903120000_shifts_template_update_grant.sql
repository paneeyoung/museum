-- shifts_template already has an UPDATE RLS policy ("Managers can update
-- shifts", added in 20260901130000) but — same lesson as employees/roster/
-- roster_shifts — it was created in the original migration and its base
-- grants were never verified per-privilege. INSERT/DELETE happen to work
-- (already used by addShift/deleteShift), but that says nothing about
-- UPDATE. Adding it explicitly rather than finding out the hard way again.
grant update on public.shifts_template to authenticated;
