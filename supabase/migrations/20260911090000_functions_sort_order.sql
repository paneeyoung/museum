-- Manager-controlled display order for function groups on the schedule
-- grid (app/manager/schedule/page.tsx's functionIdsSorted) and the
-- Functies list — previously always alphabetical (order by name), with no
-- way for the manager to change it themselves. New functions get a
-- sort_order one past the current max (see addFunction in
-- app/manager/functions/actions.ts); reordering existing ones swaps two
-- rows' sort_order values (see moveFunction in the same file).
--
-- No new RLS policy or grant needed: functions already has an
-- authenticated-manager UPDATE policy + grant from
-- 20260903090000_functions_update_policy.sql, which covers this new
-- column too.
alter table public.functions
  add column sort_order integer not null default 0;

-- One-time backfill: keep today's alphabetical order as the starting
-- point so nothing visibly reshuffles the moment this ships — reorder
-- from the Functies page afterwards to get the priority you actually want.
with ordered as (
  select id, row_number() over (order by name) as rn
  from public.functions
)
update public.functions f
set sort_order = ordered.rn
from ordered
where f.id = ordered.id;
