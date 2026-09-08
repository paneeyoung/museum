-- Staff Roster — initial schema
-- Run this in the Supabase dashboard: Project > SQL Editor > New query > paste > Run

-- Employees (one row per person who can log in; id matches Supabase auth user id)
create table if not exists public.employees (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null default 'employee' check (role in ('employee', 'manager')),
  created_at timestamptz not null default now()
);

-- Shift templates: the recurring shift slots that need to be filled every week
create table if not exists public.shifts_template (
  id uuid primary key default gen_random_uuid(),
  day_of_week smallint not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null,
  shift_name text not null,
  created_at timestamptz not null default now()
);

-- Availability: what each employee submits for a given week
create table if not exists public.availability (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  week_start_date date not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- Roster: one row per week
create table if not exists public.roster (
  id uuid primary key default gen_random_uuid(),
  week_start_date date not null unique,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

-- Roster shifts: which employee (if any) is assigned to which shift slot in a given roster
create table if not exists public.roster_shifts (
  id uuid primary key default gen_random_uuid(),
  roster_id uuid not null references public.roster(id) on delete cascade,
  shift_template_id uuid not null references public.shifts_template(id) on delete cascade,
  employee_id uuid references public.employees(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Row Level Security
alter table public.employees enable row level security;
alter table public.shifts_template enable row level security;
alter table public.availability enable row level security;
alter table public.roster enable row level security;
alter table public.roster_shifts enable row level security;

-- Starter policies (permissive, so the app works end-to-end first).
-- TODO before real rollout: restrict writes on shifts_template / roster / roster_shifts
-- to managers only, once we add a manager-only check.
create policy "Logged-in users can read employees" on public.employees
  for select using (auth.role() = 'authenticated');

create policy "Logged-in users can read shift templates" on public.shifts_template
  for select using (auth.role() = 'authenticated');

create policy "Employees can read own availability" on public.availability
  for select using (auth.uid() = employee_id);

create policy "Employees can insert own availability" on public.availability
  for insert with check (auth.uid() = employee_id);

create policy "Employees can update own availability" on public.availability
  for update using (auth.uid() = employee_id);

create policy "Logged-in users can read roster" on public.roster
  for select using (auth.role() = 'authenticated');

create policy "Logged-in users can read roster shifts" on public.roster_shifts
  for select using (auth.role() = 'authenticated');
