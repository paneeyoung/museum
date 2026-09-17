# Staff Roster Project — Progress Log

## Project
Web app to replace a €120/month subscription scheduling tool for ~40 employees.
Core feature: manager clicks one button to auto-generate the weekly roster based on
employee-submitted availability, then edits manually. Desktop + mobile browser, no app.

Full spec: see staff-scheduling-app-spec-th.md (or English version) in this folder.

## Location
Project folder: `/Users/panee/Documents/PaneeMA/Papa/Staff rooster/staff-roster`

## Tech stack
- Frontend: Next.js 16 (TypeScript, Tailwind CSS, App Router)
- Database/Auth: Supabase (magic-link login)
- Hosting (planned): Vercel

## Build order status
1. ✅ Project setup + Supabase connection
2. ✅ Auth (magic link) + manager/employee roles
3. ✅ Employee availability form (3-state pills, multi-week, copy-to-days)
4. ✅ Manager availability overview
5. ✅ Shift templates + functions/skills layer
6. ✅ Auto-plan algorithm + draft roster grid (manual edit, no publish yet)
7. ✅ Publish + employee roster view
8. ⬜ Mobile responsive polish — in progress (recent commits: employee topbar,
   pinned name column on mobile scroll, compact mobile toolbar/dropdowns)
9. ⬜ Real user testing

## Known open bugs
None currently.

## How to resume in a new Claude Code session
1. Open Terminal
2. `cd "/Users/panee/Documents/PaneeMA/Papa/Staff rooster/staff-roster"`
3. `claude`
4. Say: "Read staff-roster-progress.md and CLAUDE.md, continue from where we left off"

## Notes
- This is being built on a personal/private setup — keep Supabase and any other
  account credentials in a personal password manager, not shared with work accounts.
- Working on this in short focused sessions (one step at a time) works better with
  Claude Pro usage limits than one long continuous session.
- Full details on decisions, data model, gotchas, and security practices live in
  `CLAUDE.md` at the project root — that file is the source of truth; this log is
  just a quick-resume summary.
