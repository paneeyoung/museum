'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import WeekSelect from './WeekSelect'
import { addWeeks, currentWeekStart, formatWeekRangeLabel, parseISODate, toISODate } from '@/lib/weeks'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'

const WEEKS_AHEAD_IN_PICKER = 12

// Only these pages have a week concept — everywhere else this renders
// nothing. Shared by the unified Topbar for both roles.
const WEEK_AWARE_PATHS = [
  '/manager/availability',
  '/manager/schedule',
  '/employee/availability',
  '/employee/schedule',
]

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M12.79 5.23a.75.75 0 0 1-.02 1.06L8.832 10l3.938 3.71a.75.75 0 1 1-1.04 1.08l-4.5-4.25a.75.75 0 0 1 0-1.08l4.5-4.25a.75.75 0 0 1 1.06.02Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function TopbarWeekNav({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (!WEEK_AWARE_PATHS.includes(pathname)) return null

  const weekParam = searchParams.get('week')
  const weekStart = weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam) ? parseISODate(weekParam) : currentWeekStart()
  const weekStartDate = toISODate(weekStart)
  const prevWeek = toISODate(addWeeks(weekStart, -1))
  const nextWeek = toISODate(addWeeks(weekStart, 1))

  // The window starts from whichever is earlier — the real current week or
  // the week currently being viewed — and always extends at least
  // WEEKS_AHEAD_IN_PICKER weeks past the viewed week specifically, not just
  // a fixed 12 weeks from today. Same fix as CopyToWeekForm's window: a flat
  // 12-week span from "today" runs out of room once the viewed week is far
  // enough ahead, leaving a gap between the last listed week and wherever
  // the manager has actually navigated to (the old code only patched over
  // this by tacking the viewed week on by itself, which masked the gap
  // instead of closing it).
  const soonestWeekStart = currentWeekStart()
  const weekOptionsWindowStart = weekStart < soonestWeekStart ? weekStart : soonestWeekStart
  const weeksFromWindowStartToViewed = Math.round(
    (weekStart.getTime() - weekOptionsWindowStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
  )
  const weekOptionsCount = weeksFromWindowStartToViewed + WEEKS_AHEAD_IN_PICKER
  const weekOptions = Array.from({ length: weekOptionsCount }, (_, i) => {
    const start = addWeeks(weekOptionsWindowStart, i)
    const startDate = toISODate(start)
    const label = formatWeekRangeLabel(start, locale)
    // Mark the soonest schedulable week specifically (not just whichever
    // option happens to be first — that's no longer always the same thing
    // once the window can start earlier than "today", from viewing a past
    // week), so it's still easy to spot/jump back to.
    return { value: startDate, label: startDate === toISODate(soonestWeekStart) ? `🏠 ${label}` : label }
  })

  return (
    <div className="flex items-center gap-1.5">
      {/* Plain <a>, not <Link> — a full navigation so the target week's data
          is always fetched fresh instead of served from the client route
          cache (same reasoning as WeekSelect's window.location.href). */}
      <a
        href={`${pathname}?week=${prevWeek}`}
        title={dict.availability.prevWeek}
        aria-label={dict.availability.prevWeek}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <ChevronLeftIcon />
      </a>
      <WeekSelect basePath={pathname} weekStartDate={weekStartDate} options={weekOptions} />
      <a
        href={`${pathname}?week=${nextWeek}`}
        title={dict.availability.nextWeek}
        aria-label={dict.availability.nextWeek}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <ChevronRightIcon />
      </a>
    </div>
  )
}
