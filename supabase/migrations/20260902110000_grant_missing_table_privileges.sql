-- RLS policies only take effect once the coarser GRANT layer allows the
-- operation at all. employees never had UPDATE granted to `authenticated`
-- (confirmed by a real 42501 "permission denied for table employees" when
-- the manager name-edit form tried to update it) — its RLS policy existed
-- but could never be reached. roster/roster_shifts were created in the same
-- original migration and never had their write grants checked either, so
-- granting them proactively here rather than waiting to hit the same bug
-- again. This only grants what those tables' existing RLS policies already
-- permit; RLS still does the actual access control on top.
grant update on public.employees to authenticated;
grant insert, update on public.roster to authenticated;
grant insert, update, delete on public.roster_shifts to authenticated;
