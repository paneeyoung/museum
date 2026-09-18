import { redirect } from 'next/navigation'

// The team availability overview moved to /manager/availability (now one tab
// of the Beschikbaarheid section, alongside the manager's own availability
// form) — keep this route alive (with the week param, if any) for anyone
// with it bookmarked.
export default async function ManagerRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  redirect(week ? `/manager/availability?week=${week}` : '/manager/availability')
}
