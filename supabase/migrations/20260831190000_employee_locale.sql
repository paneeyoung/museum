-- Per-user language preference, so it follows the employee across devices.
alter table public.employees
  add column locale text not null default 'en' check (locale in ('en', 'nl'));
