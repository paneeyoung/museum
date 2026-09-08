-- Functions (skills) a shift can require and an employee can have.
create table public.functions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.employee_functions (
  employee_id uuid not null references public.employees(id) on delete cascade,
  function_id uuid not null references public.functions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (employee_id, function_id)
);

-- shifts_template becomes per-week (not a single recurring global pattern),
-- and gains a headcount and a required function. Table is unused so far, so
-- these can be added NOT NULL directly with no backfill needed.
alter table public.shifts_template
  add column week_start_date date not null,
  add column capacity integer not null default 1 check (capacity >= 1),
  add column function_id uuid not null references public.functions(id) on delete restrict;

-- Row Level Security
alter table public.functions enable row level security;
alter table public.employee_functions enable row level security;

create policy "Logged-in users can read functions" on public.functions
  for select using (auth.role() = 'authenticated');

create policy "Managers can insert functions" on public.functions
  for insert with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can delete functions" on public.functions
  for delete using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Logged-in users can read employee functions" on public.employee_functions
  for select using (auth.role() = 'authenticated');

create policy "Managers can insert employee functions" on public.employee_functions
  for insert with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can delete employee functions" on public.employee_functions
  for delete using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can insert shifts" on public.shifts_template
  for insert with check (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can update shifts" on public.shifts_template
  for update using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );

create policy "Managers can delete shifts" on public.shifts_template
  for delete using (
    exists (select 1 from public.employees e where e.id = auth.uid() and e.role = 'manager')
  );
