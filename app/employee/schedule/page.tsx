import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import WeekNav from '@/app/components/WeekNav'
import {
  addWeeks,
  buildWeekOptions,
  nextWeekStart,
  parseISODate,
  toISODate,
  WEEK_DISPLAY_ORDER,
} from '@/lib/weeks'

const WEEKS_AHEAD_IN_PICKER = 12

type ShiftRow = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  shift_name: string
  function_id: string
}

type RosterShiftRow = {
  id: string
  shift_template_id: string
  employee_id: string | null
}

export default async function EmployeeSchedulePage({
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
  const [{ data: shifts }, { data: functions }, { data: employees }, { data: roster }] = await Promise.all([
    supabase
      .from('shifts_template')
      .select('id, day_of_week, start_time, end_time, shift_name, function_id')
      .eq('week_start_date', weekStartDate)
      .returns<ShiftRow[]>(),
    supabase.from('functions').select('id, name'),
    supabase.from('employees').select('id, full_name'),
    supabase.from('roster').select('id, is_published').eq('week_start_date', weekStartDate).maybeSingle(),
  ])

  const isPublished = roster?.is_published ?? false

  const { data: rosterShifts } = isPublished
    ? await supabase
        .from('roster_shifts')
        .select('id, shift_template_id, employee_id')
        .eq('roster_id', roster!.id)
        .returns<RosterShiftRow[]>()
    : { data: null }

  const functionNameById = new Map((functions ?? []).map((f) => [f.id, f.name]))
  const employeeNameById = new Map((employees ?? []).map((e) => [e.id, e.full_name]))

  const slotsByShift = new Map<string, RosterShiftRow[]>()
  for (const row of rosterShifts ?? []) {
    const list = slotsByShift.get(row.shift_template_id) ?? []
    list.push(row)
    slotsByShift.set(row.shift_template_id, list)
  }

  const shiftsByDay = new Map<number, ShiftRow[]>()
  for (const shift of shifts ?? []) {
    const list = shiftsByDay.get(shift.day_of_week) ?? []
    list.push(shift)
    shiftsByDay.set(shift.day_of_week, list)
  }

  const weekOptions = buildWeekOptions(weekStart, WEEKS_AHEAD_IN_PICKER, locale)

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{dict.employeeSchedule.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{dict.employeeSchedule.subtitle}</p>
      </div>

      <WeekNav
        basePath="/employee/schedule"
        weekStartDate={weekStartDate}
        weekOptions={weekOptions}
        prevWeek={toISODate(addWeeks(weekStart, -1))}
        nextWeek={toISODate(addWeeks(weekStart, 1))}
        prevLabel={dict.availability.prevWeek}
        nextLabel={dict.availability.nextWeek}
        homeLabel={dict.availability.currentWeek}
      />

      <div className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {!isPublished && <p className="p-4 text-sm text-gray-500">{dict.employeeSchedule.noScheduleYet}</p>}
        {isPublished &&
          WEEK_DISPLAY_ORDER.filter((dayOfWeek) => shiftsByDay.has(dayOfWeek)).map((dayOfWeek) => (
            <div key={dayOfWeek} className="p-4">
              <p className="font-medium text-gray-900">{dict.common.dayNames[dayOfWeek]}</p>
              <ul className="mt-2 space-y-2">
                {shiftsByDay.get(dayOfWeek)!.flatMap((shift) =>
                  (slotsByShift.get(shift.id) ?? []).map((slot) => {
                    const isMe = slot.employee_id === employee.id
                    return (
                      <li
                        key={slot.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-md px-3 py-2 text-sm ${
                          isMe ? 'bg-blue-50 ring-1 ring-inset ring-blue-200' : 'bg-gray-50'
                        }`}
                      >
                        <span>
                          <span className="font-medium text-gray-900">{shift.shift_name}</span>{' '}
                          <span className="text-gray-600">
                            {shift.start_time.slice(0, 5)}–{shift.end_time.slice(0, 5)} ·{' '}
                            {functionNameById.get(shift.function_id) ?? '—'}
                          </span>
                        </span>
                        <span className={isMe ? 'font-medium text-blue-800' : 'text-gray-600'}>
                          {slot.employee_id
                            ? isMe
                              ? dict.employeeSchedule.youLabel
                              : (employeeNameById.get(slot.employee_id) ?? '—')
                            : dict.schedule.unfilledBadge}
                        </span>
                      </li>
                    )
                  })
                )}
              </ul>
            </div>
          ))}
      </div>
    </main>
  )
}
