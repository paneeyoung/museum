-- The app used to store week_start_date as a Sunday (with the UI reordering
-- days Monday-first only for display). lib/weeks.ts's startOfWeek() now
-- anchors on the Monday of the week instead, so every previously-saved
-- week_start_date (a Sunday) needs to move forward one day to line up with
-- the new Monday-anchored keys the app computes going forward.
--
-- Safe to run as a single bulk shift: every existing value is a Sunday and
-- every shifted value becomes a Monday, so the two sets can never collide
-- with each other mid-statement, and none of the existing constraints
-- (roster.week_start_date unique; availability's
-- (employee_id, week_start_date, day_of_week) unique) reference a specific
-- weekday, so a uniform +1 day shift can't violate them either.
--
-- day_of_week values (0=Sunday..6=Saturday) are NOT touched — only what
-- week_start_date anchors on changes, not what day_of_week means.
--
-- Must be deployed together with the app code change (not before, not
-- after) — old code computes Sunday keys, new code computes Monday keys,
-- so a window where code and data disagree makes the affected week look
-- empty until both sides match.
update public.availability set week_start_date = week_start_date + 1;
update public.shifts_template set week_start_date = week_start_date + 1;
update public.roster set week_start_date = week_start_date + 1;
