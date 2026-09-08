import WeekSelect from './WeekSelect'
import { nextWeekStart, toISODate } from '@/lib/weeks'

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

function HomeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10.45 2.63a.75.75 0 0 0-.9 0l-7 5.25a.75.75 0 0 0-.3.6v8.02c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-4.5h3v4.5c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75V8.48a.75.75 0 0 0-.3-.6l-7-5.25Z" />
    </svg>
  )
}

export default function WeekNav({
  basePath,
  weekStartDate,
  weekOptions,
  prevWeek,
  nextWeek,
  prevLabel,
  nextLabel,
  homeLabel,
}: {
  basePath: string
  weekStartDate: string
  weekOptions: { value: string; label: string }[]
  prevWeek: string
  nextWeek: string
  prevLabel: string
  nextLabel: string
  homeLabel: string
}) {
  const homeWeek = toISODate(nextWeekStart())

  return (
    <div className="mt-6 flex flex-wrap items-center gap-1.5">
      {/* Plain <a>, not <Link> — a full navigation so the target week's data
          is always fetched fresh instead of served from the client route
          cache (same reasoning as WeekSelect's window.location.href). */}
      <a
        href={`${basePath}?week=${prevWeek}`}
        title={prevLabel}
        aria-label={prevLabel}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <ChevronLeftIcon />
      </a>
      <WeekSelect basePath={basePath} weekStartDate={weekStartDate} options={weekOptions} />
      <a
        href={`${basePath}?week=${nextWeek}`}
        title={nextLabel}
        aria-label={nextLabel}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <ChevronRightIcon />
      </a>
      <a
        href={`${basePath}?week=${homeWeek}`}
        title={homeLabel}
        aria-label={homeLabel}
        className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <HomeIcon />
      </a>
    </div>
  )
}
