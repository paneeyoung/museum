import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import WeekNav from '@/app/components/WeekNav'
import {
  addDays,
  addWeeks,
  buildWeekOptions,
  formatDayLabel,
  nextWeekStart,
  parseISODate,
  toISODate,
  WEEK_DISPLAY_ORDER,
} from '@/lib/weeks'
import AvailabilityForm, {
  DEFAULT_END_TIME,
  DEFAULT_START_TIME,
  type DayAvailability,
} from './AvailabilityForm'

const WEEKS_AHEAD_IN_PICKER = 12

export default async function AvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect('/login')

  const locale = await getLocale()
  const dict = getDictionary(locale)

  const { week } = await searchParams
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? parseISODate(week) : nextWeekStart()
  const weekStartDate = toISODate(weekStart)

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('availability')
    .select('day_of_week, start_time, end_time, is_available, is_all_day')
    .eq('employee_id', employee.id)
    .eq('week_start_date', weekStartDate)

  const existingByDay = new Map(existing?.map((row) => [row.day_of_week, row]) ?? [])

  const days: DayAvailability[] = WEEK_DISPLAY_ORDER.map((dayOfWeek, dayIndex) => {
    const row = existingByDay.get(dayOfWeek)
    const state: DayAvailability['state'] = !row?.is_available
      ? 'unavailable'
      : row.is_all_day
        ? 'allDay'
        : 'specific'
    return {
      dayOfWeek,
      dateLabel: formatDayLabel(addDays(weekStart, dayIndex), locale),
      state,
      startTime: state === 'specific' ? row!.start_time.slice(0, 5) : DEFAULT_START_TIME,
      endTime: state === 'specific' ? row!.end_time.slice(0, 5) : DEFAULT_END_TIME,
    }
  })

  const weekOptions = buildWeekOptions(weekStart, WEEKS_AHEAD_IN_PICKER, locale)

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{dict.availability.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{dict.availability.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/employee/schedule"
            className="rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
          >
            {dict.availability.myScheduleLink}
          </Link>
          {employee.role === 'manager' && (
            <Link
              href="/manager"
              className="rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
            >
              {dict.manager.availabilityOverviewTitle}
            </Link>
          )}
          <LanguageSwitcher locale={locale} label={dict.languageSwitcher.label} />
        </div>
      </div>

      <WeekNav
        basePath="/employee/availability"
        weekStartDate={weekStartDate}
        weekOptions={weekOptions}
        prevWeek={toISODate(addWeeks(weekStart, -1))}
        nextWeek={toISODate(addWeeks(weekStart, 1))}
        prevLabel={dict.availability.prevWeek}
        nextLabel={dict.availability.nextWeek}
        homeLabel={dict.availability.currentWeek}
      />

      <div className="mt-6">
        <AvailabilityForm key={weekStartDate} weekStartDate={weekStartDate} days={days} dict={dict} locale={locale} />
      </div>
    </main>
  )
}
