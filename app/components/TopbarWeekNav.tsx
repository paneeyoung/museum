'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import WeekSelect from './WeekSelect'
import { addWeeks, formatWeekRangeLabel, nextWeekStart, parseISODate, toISODate } from '@/lib/weeks'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'

const WEEKS_AHEAD_IN_PICKER = 12

// Only these two manager pages have a week concept — everywhere else this
// renders nothing.
const WEEK_AWARE_PATHS = ['/manager', '/manager/schedule']

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
  const weekStart = weekParam && /^\d{4}-\d{2}-\d{2}$/.test(weekParam) ? parseISODate(weekParam) : nextWeekStart()
  const weekStartDate = toISODate(weekStart)
  const prevWeek = toISODate(addWeeks(weekStart, -1))
  const nextWeek = toISODate(addWeeks(weekStart, 1))

  const weekOptions = Array.from({ length: WEEKS_AHEAD_IN_PICKER }, (_, i) => {
    const start = addWeeks(nextWeekStart(), i)
    const label = formatWeekRangeLabel(start, locale)
    // First option is the soonest schedulable week — mark it so it's easy
    // to spot/jump back to among the other 11.
    return { value: toISODate(start), label: i === 0 ? `🏠 ${label}` : label }
  })

  // Prev/next can step outside that fixed forward-looking window (e.g.
  // clicking "previous" from the soonest week, or "next" past the last
  // listed one) — without a matching <option>, the native <select> just
  // shows nothing selected. Make sure whichever week is actually being
  // viewed always has one.
  if (!weekOptions.some((option) => option.value === weekStartDate)) {
    weekOptions.unshift({ value: weekStartDate, label: formatWeekRangeLabel(weekStart, locale) })
  }

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
