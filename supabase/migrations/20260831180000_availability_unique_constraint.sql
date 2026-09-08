-- One availability row per employee/week/day so saves can upsert instead of duplicating.
alter table public.availability
  add constraint availability_employee_week_day_unique
  unique (employee_id, week_start_date, day_of_week);
