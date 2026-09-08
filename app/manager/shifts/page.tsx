import { redirect } from 'next/navigation'

// Shifts and the schedule editor were merged into one page — keep this route
// alive (with the week param, if any) for anyone with it bookmarked.
export default async function ShiftsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  redirect(week ? `/manager/schedule?week=${week}` : '/manager/schedule')
}
