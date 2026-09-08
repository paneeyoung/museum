import { Fragment } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import {
  addDays,
  addWeeks,
  formatDayLabel,
  formatWeekRangeLabel,
  nextWeekStart,
  parseISODate,
  toISODate,
  WEEK_DISPLAY_ORDER,
} from '@/lib/weeks'
import { copyPreviousWeek } from './actions'
import AddShiftForm from './AddShiftForm'
import AddShiftCell from './AddShiftCell'
import AutoPlanButton from './AutoPlanButton'
import AssignmentSelect from './AssignmentSelect'
import PublishControls from './PublishControls'
import FunctionNameEditor from './FunctionNameEditor'
import ShiftCellHeader from './ShiftCellHeader'
import ShiftRowLabel from './ShiftRowLabel'
import CopyToWeekForm from './CopyToWeekForm'

const WEEKS_AHEAD_IN_PICKER = 12

// One pastel card style per function, so all shifts needing the same
// function are visually grouped at a glance across the whole week.
const FUNCTION_CARD_STYLES = [
  'border-rose-200 bg-rose-50',
  'border-amber-200 bg-amber-50',
  'border-emerald-200 bg-emerald-50',
  'border-sky-200 bg-sky-50',
  'border-violet-200 bg-violet-50',
  'border-pink-200 bg-pink-50',
  'border-teal-200 bg-teal-50',
  'border-orange-200 bg-orange-50',
]

function cardStyleForFunction(functionId: string) {
  let hash = 0
  for (let i = 0; i < functionId.length; i++) {
    hash = (hash * 31 + functionId.charCodeAt(i)) | 0
  }
  return FUNCTION_CARD_STYLES[Math.abs(hash) % FUNCTION_CARD_STYLES.length]
}

type ShiftRow = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  shift_name: string
  capacity: number
  function_id: string
}

type RosterShiftRow = {
  id: string
  shift_template_id: string
  employee_id: string | null
}

// One row-group per (function, shift name) combo, spanning all 7 day
// columns — e.g. "Sleutelhouder" occurring Mon/Wed/Fri becomes rows
// "Sleutelhouder 01"/"02" with the other weekdays' cells blank.
type ShiftRowGroup = {
  functionId: string
  shiftName: string
  maxCapacity: number
  byDay: Map<number, ShiftRow>
}

export default async function ManagerSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const locale = await getLocale()
  const dict = getDictionary(locale)

  const { week } = await searchParams
  const weekStart = week && /^\d{4}-\d{2}-\d{2}$/.test(week) ? parseISODate(week) : nextWeekStart()
  const weekStartDate = toISODate(weekStart)
  const prevWeekStartDate = toISODate(addWeeks(weekStart, -1))

  const supabase = await createClient()
  const [{ data: shifts }, { data: functions }, { data: employees }, { data: roster }, { count: prevWeekShiftCount }] =
    await Promise.all([
      supabase
        .from('shifts_template')
        .select('id, day_of_week, start_time, end_time, shift_name, capacity, function_id')
        .eq('week_start_date', weekStartDate)
        .returns<ShiftRow[]>(),
      supabase.from('functions').select('id, name').order('name'),
      supabase.from('employees').select('id, full_name').order('full_name'),
      supabase
        .from('roster')
        .select('id, is_published')
        .eq('week_start_date', weekStartDate)
        .maybeSingle(),
      supabase
        .from('shifts_template')
        .select('id', { count: 'exact', head: true })
        .eq('week_start_date', prevWeekStartDate),
    ])

  const { data: rosterShifts } = roster
    ? await supabase
        .from('roster_shifts')
        .select('id, shift_template_id, employee_id')
        .eq('roster_id', roster.id)
        .order('id')
        .returns<RosterShiftRow[]>()
    : { data: null }

  const functionNameById = new Map((functions ?? []).map((f) => [f.id, f.name]))

  const slotsByShift = new Map<string, RosterShiftRow[]>()
  for (const row of rosterShifts ?? []) {
    const list = slotsByShift.get(row.shift_template_id) ?? []
    list.push(row)
    slotsByShift.set(row.shift_template_id, list)
  }

  const rowGroupsByKey = new Map<string, ShiftRowGroup>()
  for (const shift of shifts ?? []) {
    const key = `${shift.function_id}::${shift.shift_name}`
    const existing = rowGroupsByKey.get(key)
    if (existing) {
      existing.byDay.set(shift.day_of_week, shift)
      existing.maxCapacity = Math.max(existing.maxCapacity, shift.capacity)
    } else {
      rowGroupsByKey.set(key, {
        functionId: shift.function_id,
        shiftName: shift.shift_name,
        maxCapacity: shift.capacity,
        byDay: new Map([[shift.day_of_week, shift]]),
      })
    }
  }

  const rowGroupsByFunction = new Map<string, ShiftRowGroup[]>()
  for (const group of rowGroupsByKey.values()) {
    const list = rowGroupsByFunction.get(group.functionId) ?? []
    list.push(group)
    rowGroupsByFunction.set(group.functionId, list)
  }
  for (const list of rowGroupsByFunction.values()) {
    list.sort((a, b) => a.shiftName.localeCompare(b.shiftName))
  }

  const functionIdsSorted = [...rowGroupsByFunction.keys()].sort((a, b) =>
    (functionNameById.get(a) ?? '').localeCompare(functionNameById.get(b) ?? '')
  )

  const weekOptions = Array.from({ length: WEEKS_AHEAD_IN_PICKER }, (_, i) => {
    const start = addWeeks(nextWeekStart(), i)
    return { value: toISODate(start), label: formatWeekRangeLabel(start, locale) }
  })

  const hasFunctions = (functions ?? []).length > 0
  const canCopyPreviousWeek = (shifts ?? []).length === 0 && (prevWeekShiftCount ?? 0) > 0
  const hasDraft = (rosterShifts ?? []).length > 0
  const isPublished = roster?.is_published ?? false

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div>
        <div className="mt-3">
          {hasFunctions ? (
            <AddShiftForm weekStartDate={weekStartDate} functions={functions ?? []} dict={dict} />
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p>{dict.shifts.noFunctionsWarning}</p>
              <Link href="/manager/functions" className="mt-2 inline-block font-medium underline">
                {dict.shifts.goToFunctions}
              </Link>
            </div>
          )}
        </div>

        {canCopyPreviousWeek && (
          <form action={copyPreviousWeek.bind(null, weekStartDate)} className="mt-4">
            <button
              type="submit"
              className="rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
            >
              {dict.shifts.copyPreviousWeek}
            </button>
          </form>
        )}

        {(shifts ?? []).length > 0 && (
          <div className="mt-4">
            <CopyToWeekForm
              weekStartDate={weekStartDate}
              weekOptions={weekOptions.filter((w) => w.value !== weekStartDate)}
              dict={dict}
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <AutoPlanButton
          weekStartDate={weekStartDate}
          hasExistingDraft={hasDraft}
          disabled={isPublished}
          dict={dict}
        />
        {roster && <PublishControls rosterId={roster.id} isPublished={isPublished} dict={dict} />}
      </div>

      <div className="mt-4">
        {(shifts ?? []).length === 0 && (
          <p className="rounded-lg border border-gray-200 p-4 text-sm text-gray-500">
            {dict.shifts.noShiftsYet}
          </p>
        )}
        {(shifts ?? []).length > 0 && !hasDraft && (
          <p className="mb-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-500">
            {dict.schedule.noDraftYet}
          </p>
        )}

        {(shifts ?? []).length > 0 && (
          <div className="overflow-x-auto pb-2">
            <table className="w-full min-w-[900px] table-fixed border-collapse text-xs">
              <colgroup>
                <col style={{ width: '14%' }} />
                {WEEK_DISPLAY_ORDER.map((dayOfWeek) => (
                  // Museum is closed Mondays — that column stays mostly empty,
                  // so give it less width than the other six.
                  <col key={dayOfWeek} style={{ width: dayOfWeek === 1 ? '7%' : `${79 / 6}%` }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="border border-gray-200 bg-gray-50 p-2 text-left"></th>
                  {WEEK_DISPLAY_ORDER.map((dayOfWeek, dayIndex) => (
                    <th key={dayOfWeek} className="border border-gray-200 bg-gray-100 p-2 text-center">
                      <p className="text-sm font-medium text-gray-900">{dict.common.dayNames[dayOfWeek]}</p>
                      <p className="text-xs font-normal text-gray-500">
                        {formatDayLabel(addDays(weekStart, dayIndex), locale)}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {functionIdsSorted.map((functionId) => (
                  <Fragment key={functionId}>
                    <tr>
                      <td
                        colSpan={WEEK_DISPLAY_ORDER.length + 1}
                        className="border border-gray-200 bg-gray-100 px-2 py-1.5"
                      >
                        <FunctionNameEditor
                          functionId={functionId}
                          name={functionNameById.get(functionId) ?? '—'}
                          dict={dict}
                        />
                      </td>
                    </tr>
                    {rowGroupsByFunction.get(functionId)!.map((group) => {
                      const sampleShift = group.byDay.values().next().value as ShiftRow
                      return Array.from({ length: group.maxCapacity }, (_, slotIndex) => (
                        <tr key={`${functionId}-${group.shiftName}-${slotIndex}`}>
                          <td className="border border-gray-200 bg-gray-50 p-2 align-top text-xs font-medium text-gray-700">
                            <ShiftRowLabel
                              shiftIds={[...group.byDay.values()].map((s) => s.id)}
                              shiftName={group.shiftName}
                              slotNumber={String(slotIndex + 1).padStart(2, '0')}
                              dict={dict}
                            />
                          </td>
                          {WEEK_DISPLAY_ORDER.map((dayOfWeek, dayIndex) => {
                            const shift = group.byDay.get(dayOfWeek)
                            if (!shift) {
                              return (
                                <td
                                  key={dayOfWeek}
                                  className="border border-gray-200 bg-white p-1 text-center text-gray-300"
                                >
                                  {slotIndex === 0 ? (
                                    <AddShiftCell
                                      weekStartDate={weekStartDate}
                                      dayOfWeek={dayOfWeek}
                                      dayLabel={`${dict.common.dayNames[dayOfWeek]} · ${formatDayLabel(addDays(weekStart, dayIndex), locale)}`}
                                      functionId={group.functionId}
                                      shiftName={group.shiftName}
                                      defaultStartTime={sampleShift.start_time}
                                      defaultEndTime={sampleShift.end_time}
                                      defaultCapacity={sampleShift.capacity}
                                      dict={dict}
                                    />
                                  ) : (
                                    '—'
                                  )}
                                </td>
                              )
                            }
                            if (slotIndex >= shift.capacity) {
                              return (
                                <td
                                  key={dayOfWeek}
                                  className="border border-gray-200 bg-white p-2 text-center text-gray-300"
                                >
                                  —
                                </td>
                              )
                            }
                            const slots = slotsByShift.get(shift.id) ?? []
                            const slot = slots[slotIndex]
                            return (
                              <td
                                key={dayOfWeek}
                                className={`border p-2 align-top ${cardStyleForFunction(shift.function_id)}`}
                              >
                                {slotIndex === 0 && (
                                  <ShiftCellHeader
                                    key={shift.id}
                                    shiftId={shift.id}
                                    shiftName={shift.shift_name}
                                    startTime={shift.start_time}
                                    endTime={shift.end_time}
                                    dict={dict}
                                  />
                                )}
                                {slot ? (
                                  <AssignmentSelect
                                    rosterShiftId={slot.id}
                                    employeeId={slot.employee_id}
                                    employees={employees ?? []}
                                    dict={dict}
                                    disabled={isPublished}
                                  />
                                ) : (
                                  <span className="text-[11px] text-gray-400">—</span>
                                )}
                              </td>
                            )
                          })}
                        </tr>
                      ))
                    })}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
