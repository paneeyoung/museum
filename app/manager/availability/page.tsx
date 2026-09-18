import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import { addDays, nextWeekStart, parseISODate, toISODate, WEEK_DISPLAY_ORDER } from '@/lib/weeks'

type AvailabilityRow = {
  employee_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  is_all_day: boolean
}

export default async function ManagerAvailabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const locale = await getLocale()
  const dict = getDictionary(locale)

  const { week } = await searchParams
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? parseISODate(week) : nextWeekStart()
  const weekStartDate = toISODate(weekStart)

  const supabase = await createClient()
  const [{ data: employees }, { data: availability }] = await Promise.all([
    supabase.from('employees').select('id, full_name').order('full_name'),
    supabase
      .from('availability')
      .select('employee_id, day_of_week, start_time, end_time, is_available, is_all_day')
      .eq('week_start_date', weekStartDate),
  ])

  const availabilityByEmployee = new Map<string, Map<number, AvailabilityRow>>()
  for (const row of availability ?? []) {
    if (!availabilityByEmployee.has(row.employee_id)) {
      availabilityByEmployee.set(row.employee_id, new Map())
    }
    availabilityByEmployee.get(row.employee_id)!.set(row.day_of_week, row)
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">{dict.manager.availabilityOverviewTitle}</h1>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-green-50 ring-1 ring-inset ring-green-200" />
          {dict.availability.allDay}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-amber-50 ring-1 ring-inset ring-amber-200" />
          {dict.availability.specific}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-red-50 ring-1 ring-inset ring-red-200" />
          {dict.availability.unavailable}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-white ring-1 ring-inset ring-gray-300" />
          {dict.manager.notSubmitted}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 border-r border-gray-200 bg-gray-50 px-4 py-3 text-left font-medium text-gray-500">
                {dict.manager.employeeColumn}
              </th>
              {WEEK_DISPLAY_ORDER.map((dayOfWeek, dayIndex) => (
                <th key={dayOfWeek} className="px-4 py-3 text-left font-medium text-gray-500">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500">
                    {dict.common.dayAbbrev[dayOfWeek]}
                  </div>
                  <div className="text-base font-bold text-gray-900">{addDays(weekStart, dayIndex).getDate()}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(employees ?? []).map((emp) => {
              const byDay = availabilityByEmployee.get(emp.id)
              return (
                <tr key={emp.id}>
                  <td className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 font-medium text-gray-900">
                    {emp.full_name}
                  </td>
                  {WEEK_DISPLAY_ORDER.map((dayOfWeek) => {
                    const row = byDay?.get(dayOfWeek)
                    const cellClass = !row
                      ? 'bg-white text-gray-400 italic'
                      : !row.is_available
                        ? 'bg-red-50 text-red-700'
                        : row.is_all_day
                          ? 'bg-green-50 text-green-800'
                          : 'bg-amber-50 text-amber-900'
                    return (
                      <td key={dayOfWeek} className={`px-4 py-3 ${cellClass}`}>
                        {!row ? (
                          dict.manager.notSubmitted
                        ) : !row.is_available ? (
                          dict.availability.unavailable
                        ) : row.is_all_day ? (
                          dict.availability.allDay
                        ) : (
                          `${row.start_time.slice(0, 5)}–${row.end_time.slice(0, 5)}`
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
