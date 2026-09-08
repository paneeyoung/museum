@AGENTS.md

# Staff Roster App — Project Context

## What this is
Web app replacing a €120/month subscription scheduling tool for ~40 employees.
Core feature: manager clicks one button ("Auto-plan") to auto-generate the weekly
roster based on employee-submitted availability + required functions, then edits
manually before publishing.

## Tech stack
- Next.js 16 (App Router, TypeScript, Tailwind CSS)
- Supabase (Postgres + magic-link auth)
- Hosting: Vercel (planned, not yet deployed)
- i18n: EN + NL, dictionaries in lib/i18n/dictionaries.ts

## Key decisions already made (don't re-litigate these)
- The stored `week_start_date` is genuinely **Monday-anchored** (changed
  2026-09-06 — `startOfWeek()` in lib/weeks.ts now rewinds to the most
  recent Monday; it used to rewind to Sunday with the UI just reordering
  days Monday-first for display). `day_of_week` values (0=Sunday..6=Saturday,
  JS `Date.getDay()` convention) were deliberately left unchanged — a
  `day_of_week` value is NOT the same thing as "days after week_start_date";
  code that needs an actual calendar date for a given day converts via
  `WEEK_DISPLAY_ORDER`'s map index (already Monday-first: `[1,2,3,4,5,6,0]`),
  not via the raw `day_of_week` value — see the comments in lib/weeks.ts.
  This required a one-time data migration
  (`20260906120000_shift_week_start_to_monday.sql`) shifting every existing
  `week_start_date` forward by 1 day (old Sunday → new Monday) across
  `availability`, `shifts_template`, and `roster` — verified safe (no
  constraint references a specific weekday, and old/new value sets can't
  collide since one is all Sundays and the other all Mondays), but it must
  be deployed in lockstep with this code change, not before or after it.
- Availability has 3 states per day: niet beschikbaar / hele dag / specifieke tijd
  (free-form start/end time, not fixed blocks)
- Toggling niet beschikbaar → beschikbaar resets time to default (09:00–17:00)
- Shift templates are **per-week**, not a single fixed recurring pattern
  (shifts_template has week_start_date + capacity + function_id)
- Shifts require a function/skill (functions table, many-to-many via
  employee_functions — an employee can have multiple functions)
- Auto-plan v1 (built): matches availability + required function only, first
  qualified+available employee wins (alphabetical by name, for determinism) —
  no fairness/rotation, no max-hours enforcement, and manual edits to the draft
  grid aren't conflict-checked either. Refuses to run against an already-published
  roster. Regenerating overwrites the existing draft for that week (confirmed
  client-side before it happens). These can be revisited once the basic loop is
  validated with real use.
- Publishing (built): a published roster is locked — Auto-plan and the manual
  assignment dropdowns are both disabled (server-side, not just UI, for the
  dropdowns) once `roster.is_published` is true. A manager can Unpublish to
  make corrections, which re-enables editing; there's no audit trail of what
  changed. The employee-facing schedule at /employee/schedule only ever shows
  published rosters, and shows the **full week for everyone** (not just the
  viewer's own shifts), with the viewer's own slots labeled "You" and
  highlighted — deliberate, so people can spot swap opportunities.
- /manager/shifts and /manager/schedule were merged into one page
  (2026-09-03) — defining shifts, running Auto-plan, and the draft grid all
  live at /manager/schedule now, so switching tabs mid-flow isn't needed.
  /manager/shifts still exists only as a redirect (preserves the `week`
  param) in case it's bookmarked; ManagerNav no longer links to it directly.
- Manager navigation was consolidated into a shared topbar (2026-09-03):
  `app/manager/layout.tsx` now does the manager-role guard once for every
  /manager/* route and renders `ManagerTopbar` (in app/components/), instead
  of each page redirecting + rendering its own nav/LanguageSwitcher. Topbar
  has Roostereditor + Beschikbaarheidsoverzicht as direct links, a "Beheer"
  dropdown for Functies/Medewerkers, and a right-side menu bundling "Mijn
  beschikbaarheid" + the language switcher. The old flat-row `ManagerNav`
  component is gone. Pages that don't otherwise need the employee record
  (most of them) no longer call `getCurrentEmployee()` at all — only
  /manager/employees/[id] still does, since it needs the id for the
  can't-delete-yourself check.
- Manager pages live under /manager/* (schedule, functions, employees,
  availability overview). Employee pages under /employee/* (availability, schedule)
  are open to ANY logged-in user, including managers, since a manager may also
  work shifts themselves.
- Employees still only get their `employees` row auto-created via the
  Supabase auth trigger `on_auth_user_created` — but a manager can now
  trigger that trigger ahead of time. Pre-invite (built 2026-09-05): the
  manager-only "Invite employee" form on /manager/employees calls
  `auth.admin.inviteUserByEmail` (service_role, via `createAdminClient()`,
  guarded by a manager-role check — same pattern as `deleteEmployee`).
  That creates the `auth.users` row, the trigger fires as usual and creates
  the `employees` row, then a follow-up admin-client update sets
  role/functions if the manager picked non-defaults. No schema change: an
  earlier "placeholder record with no auth user yet" design was considered
  and rejected because `employees.id references auth.users(id)` is a hard
  FK — a placeholder would need decoupling that column from `auth.users`
  entirely (new `auth_user_id` column, rewritten RLS, rewritten
  `getCurrentEmployee()`) for no real benefit, since the invite/login email
  either way shares the same rate-limited mailer (see below). Not yet
  tested against a real inbox/rate limit — build + typecheck verified only.

## Data model (current)
- employees: id, full_name, email, role (manager/employee), locale (en/nl)
- functions: id, name (manager-defined skills, e.g. "kassa", "keuken")
- employee_functions: employee_id, function_id (many-to-many join)
- availability: id, employee_id, week_start_date, day_of_week, is_available (bool),
  is_all_day (bool), start_time, end_time
- shifts_template: id, week_start_date, day_of_week, start_time, end_time,
  shift_name, capacity, function_id
- roster: id, week_start_date (unique), is_published (bool)
- roster_shifts: id, roster_id, shift_template_id, employee_id (nullable) — one
  row per capacity slot; null employee_id means that slot is unfilled

## Known open bugs
None currently. (The previously-reported "week dropdown date headers don't
update" bug was verified fixed 2026-09-02: WeekSelect.tsx's hard
`window.location.href` navigation bypasses the client Router Cache, and
manager/page.tsx recomputes weekStart fresh from searchParams on every
render with no memoization — traced the code path and confirmed the date
math is correct and stateless.)

Fixed 2026-09-06: an unsaved edit on the employee availability form (e.g.
toggling a day to "niet beschikbaar" without clicking Save) would visibly
carry over to other weeks after navigating with the Prev/Next week links.
Root cause: `AvailabilityForm`'s local `dayStates`/`startTimes`/`endTimes`
state is seeded from the `days` prop via `useState(days.map(...))`, which
only runs on mount — the Prev/Next links are a client-side `<Link>` nav, so
the server re-renders with fresh `days` but the client component wasn't
remounted, so its stale in-memory state kept showing instead of resyncing.
Confirmed this was display-only (no autosave path exists — `saveAvailability`
only runs on explicit submit), but if unnoticed and then Saved, it would
have written the wrong week's data for real. Fixed by adding
`key={weekStartDate}` where `<AvailabilityForm>` is rendered in
`app/employee/availability/page.tsx`, forcing a full remount (and state
reset) on every week change — the same pattern already used one level
down for `WeekRangePicker` inside that same form, just not applied at the
top level.

## Security practices for this project
- Never use the Supabase service_role key for routine tasks — it bypasses all
  RLS policies. Only the anon/publishable key is used in normal app code.
- Supabase access tokens (for CLI/migrations) are meant to be single-use:
  generate, use once in the user's own terminal (not pasted into chat), revoke
  immediately after.
  **Settled 2026-09-06:** if a command pasted into chat contains what looks
  like a live secret/token (e.g. `SUPABASE_ACCESS_TOKEN=sbp_...`), Claude Code
  should decline to execute it — flag that the token is now exposed in
  session history, recommend rotating it, and ask the user to run the
  command themselves in their own terminal instead. This happened for real
  at least twice before this was settled; any token that was ever pasted into
  chat should be treated as compromised and rotated.
- Database migrations are reviewed before pushing, then pushed via
  `SUPABASE_ACCESS_TOKEN=<token> npx supabase db push --linked`.

## Gotchas learned the hard way
- An RLS policy allowing an operation is not enough — the base SQL `GRANT` to
  the `authenticated` role also has to exist, or you get a plain
  `permission denied for table X` (Postgres code 42501) before RLS is even
  evaluated. Hit this for real on `employees` UPDATE (2026-09-02): the RLS
  policy was correct and had been pushed, but `authenticated` never had
  `GRANT UPDATE` on that table, so every save silently failed until fixed
  in `20260902110000_grant_missing_table_privileges.sql`. `roster` and
  `roster_shifts` got the same proactive grant fix at the same time since
  they were created in that same original migration and had never been
  write-tested. **When adding a new RLS write policy on a table that's never
  had writes before, also double check its base grants** — don't assume a
  clean `db push` means the feature actually works end-to-end.
- Supabase query errors are easy to lose: `const { data, error } = await
  supabase...` and only using `data` means a real failure just looks like
  an empty result, with nothing in the browser console since the failure
  happened server-side. Worth `console.error`-ing the `error` in server
  actions, at least while a new write path is still unproven.

## Deferred / future feature ideas (not yet built)
- Manager sets default working days per employee (e.g. 5 days/week), with the
  availability form pre-filling from that default instead of starting blank
- Optional comment/reason field when marking "niet beschikbaar" (pending
  schoonvader's approval)
- Diensten (shift templates) page could use a visual calendar/grid layout
  instead of the current form + flat list — worth revisiting after auto-plan
  is working and real usage patterns are clearer.

## Build order status
1. ✅ Project setup + Supabase connection
2. ✅ Auth (magic link) + manager/employee roles
3. ✅ Employee availability form (3-state pills, multi-week, copy-to-days)
4. ✅ Manager availability overview
5. ✅ Shift templates + functions/skills layer
6. ✅ Auto-plan algorithm + draft roster grid (manual edit, no publish yet)
7. ✅ Publish + employee roster view
8. ⬜ Mobile responsive polish
9. ⬜ Real user testing

## Working style notes
- Build one step at a time, verify manually in the browser before moving on
- Use `/clear` between unrelated steps, `/compact` when still mid-feature but
  context is getting long
- For schema/architecture decisions (not just UI tweaks), explain the plan
  before implementing
