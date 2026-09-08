-- Distinguish "available all day" from "available specific hours" (both are
-- is_available=true today). Default false preserves the current meaning of every
-- existing row: they were entered as specific start/end times, not "all day".
alter table public.availability
  add column is_all_day boolean not null default false;
