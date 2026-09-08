'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { addWeeks, parseISODate, toISODate, WEEK_DISPLAY_ORDER } from '@/lib/weeks'

export type AddShiftErrorCode = 'errorMissingFields' | 'errorStartBeforeEnd' | 'errorGeneric'

export type AddShiftState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: AddShiftErrorCode
}

export async function addShift(
  _prevState: AddShiftState,
  formData: FormData
): Promise<AddShiftState> {
  const weekStartDate = formData.get('weekStartDate')
  const dayOfWeek = formData.get('dayOfWeek')
  const startTime = formData.get('startTime')
  const endTime = formData.get('endTime')
  const label = formData.get('label')
  const capacity = formData.get('capacity')
  const functionId = formData.get('functionId')

  if (
    typeof weekStartDate !== 'string' ||
    typeof dayOfWeek !== 'string' ||
    typeof startTime !== 'string' ||
    typeof endTime !== 'string' ||
    typeof label !== 'string' ||
    typeof capacity !== 'string' ||
    typeof functionId !== 'string' ||
    !weekStartDate ||
    !dayOfWeek ||
    !startTime ||
    !endTime ||
    !label.trim() ||
    !capacity ||
    !functionId
  ) {
    return { status: 'error', errorCode: 'errorMissingFields' }
  }

  if (startTime >= endTime) {
    return { status: 'error', errorCode: 'errorStartBeforeEnd' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('shifts_template').insert({
    week_start_date: weekStartDate,
    day_of_week: Number(dayOfWeek),
    start_time: startTime,
    end_time: endTime,
    shift_name: label.trim(),
    capacity: Number(capacity),
    function_id: functionId,
  })

  if (error) {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/schedule')
  return { status: 'success' }
}

export async function deleteShift(id: string) {
  const supabase = await createClient()
  await supabase.from('shifts_template').delete().eq('id', id)
  revalidatePath('/manager/schedule')
}

export type UpdateShiftResult = { status: 'success' } | { status: 'error' }

export async function updateShift(
  shiftId: string,
  input: { shiftName: string; startTime: string; endTime: string }
): Promise<UpdateShiftResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('shifts_template')
    .update({
      shift_name: input.shiftName,
      start_time: input.startTime,
      end_time: input.endTime,
    })
    .eq('id', shiftId)

  if (error) {
    console.error('updateShift failed:', error)
    return { status: 'error' }
  }

  revalidatePath('/manager/schedule')
  return { status: 'success' }
}

export type RenameShiftGroupResult = { status: 'success' } | { status: 'error' }

// Renames every shifts_template row in the group at once (e.g. all the days
// "od" occurs on) — the grid's row label represents the whole group, not
// any single day, so that's what clicking it should rename.
export async function renameShiftGroup(
  shiftIds: string[],
  name: string
): Promise<RenameShiftGroupResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('shifts_template').update({ shift_name: name }).in('id', shiftIds)

  if (error) {
    console.error('renameShiftGroup failed:', error)
    return { status: 'error' }
  }

  revalidatePath('/manager/schedule')
  return { status: 'success' }
}

export async function copyPreviousWeek(weekStartDate: string) {
  const supabase = await createClient()
  const prevWeek = toISODate(addWeeks(parseISODate(weekStartDate), -1))

  const { count } = await supabase
    .from('shifts_template')
    .select('id', { count: 'exact', head: true })
    .eq('week_start_date', weekStartDate)

  // Safety: never duplicate into a week that already has shifts.
  if (count && count > 0) {
    return
  }

  const { data: prevShifts } = await supabase
    .from('shifts_template')
    .select('day_of_week, start_time, end_time, shift_name, capacity, function_id')
    .eq('week_start_date', prevWeek)

  if (!prevShifts || prevShifts.length === 0) {
    return
  }

  await supabase.from('shifts_template').insert(
    prevShifts.map((s) => ({
      week_start_date: weekStartDate,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      shift_name: s.shift_name,
      capacity: s.capacity,
      function_id: s.function_id,
    }))
  )

  revalidatePath('/manager/schedule')
}

export type CopyToWeekErrorCode =
  | 'errorNoShiftsToCopy'
  | 'errorNoWeeksSelected'
  | 'errorAllTargetsHaveShifts'
  | 'errorGeneric'

export type CopyToWeekState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: CopyToWeekErrorCode
  copiedCount?: number
  skippedCount?: number
}

// Forward-direction sibling of copyPreviousWeek: copies the currently-viewed
// week's shifts into one or more weeks the manager picks, instead of only
// pulling the previous week into an empty current one.
export async function copyShiftsToWeek(
  sourceWeekStartDate: string,
  _prevState: CopyToWeekState,
  formData: FormData
): Promise<CopyToWeekState> {
  const targetWeeks = formData.getAll('targetWeek').filter((v): v is string => typeof v === 'string' && v.length > 0)

  if (targetWeeks.length === 0) {
    return { status: 'error', errorCode: 'errorNoWeeksSelected' }
  }

  const supabase = await createClient()

  const { data: sourceShifts } = await supabase
    .from('shifts_template')
    .select('day_of_week, start_time, end_time, shift_name, capacity, function_id')
    .eq('week_start_date', sourceWeekStartDate)

  if (!sourceShifts || sourceShifts.length === 0) {
    return { status: 'error', errorCode: 'errorNoShiftsToCopy' }
  }

  const { data: existing } = await supabase
    .from('shifts_template')
    .select('week_start_date')
    .in('week_start_date', targetWeeks)

  // Safety: never duplicate into a week that already has shifts.
  const weeksWithExistingShifts = new Set((existing ?? []).map((row) => row.week_start_date))
  const weeksToCopy = targetWeeks.filter((week) => !weeksWithExistingShifts.has(week))
  const skippedCount = targetWeeks.length - weeksToCopy.length

  if (weeksToCopy.length === 0) {
    return { status: 'error', errorCode: 'errorAllTargetsHaveShifts' }
  }

  const rows = weeksToCopy.flatMap((week) =>
    sourceShifts.map((s) => ({
      week_start_date: week,
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      shift_name: s.shift_name,
      capacity: s.capacity,
      function_id: s.function_id,
    }))
  )

  const { error } = await supabase.from('shifts_template').insert(rows)

  if (error) {
    console.error('copyShiftsToWeek failed:', error)
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/schedule')
  return { status: 'success', copiedCount: weeksToCopy.length, skippedCount }
}

export type AutoPlanErrorCode = 'errorNoShifts' | 'errorAlreadyPublished' | 'errorGeneric'

export type AutoPlanState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: AutoPlanErrorCode
  filledSlots?: number
  totalSlots?: number
}

type ShiftTemplateRow = {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  capacity: number
  function_id: string
}

type AvailabilityRow = {
  employee_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
  is_all_day: boolean
}

const dayRank = new Map<number, number>(WEEK_DISPLAY_ORDER.map((day, index) => [day, index]))

function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd
}

export async function runAutoPlan(
  weekStartDate: string,
  _prevState: AutoPlanState,
  _formData: FormData
): Promise<AutoPlanState> {
  const supabase = await createClient()

  const [{ data: shifts }, { data: availability }, { data: employeeFunctions }, { data: employees }] =
    await Promise.all([
      supabase
        .from('shifts_template')
        .select('id, day_of_week, start_time, end_time, capacity, function_id')
        .eq('week_start_date', weekStartDate)
        .returns<ShiftTemplateRow[]>(),
      supabase
        .from('availability')
        .select('employee_id, day_of_week, start_time, end_time, is_available, is_all_day')
        .eq('week_start_date', weekStartDate)
        .returns<AvailabilityRow[]>(),
      supabase.from('employee_functions').select('employee_id, function_id'),
      supabase.from('employees').select('id, full_name').order('full_name'),
    ])

  if (!shifts || shifts.length === 0) {
    return { status: 'error', errorCode: 'errorNoShifts' }
  }

  const { data: roster, error: rosterError } = await supabase
    .from('roster')
    .upsert({ week_start_date: weekStartDate }, { onConflict: 'week_start_date' })
    .select('id, is_published')
    .single()

  if (rosterError || !roster) {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  if (roster.is_published) {
    return { status: 'error', errorCode: 'errorAlreadyPublished' }
  }

  const functionsByEmployee = new Map<string, Set<string>>()
  for (const row of employeeFunctions ?? []) {
    if (!functionsByEmployee.has(row.employee_id)) {
      functionsByEmployee.set(row.employee_id, new Set())
    }
    functionsByEmployee.get(row.employee_id)!.add(row.function_id)
  }

  const availabilityByEmployeeDay = new Map<string, AvailabilityRow>()
  for (const row of availability ?? []) {
    availabilityByEmployeeDay.set(`${row.employee_id}-${row.day_of_week}`, row)
  }

  // Intervals each employee is already committed to this run, so we don't
  // double-book someone across overlapping shifts on the same day.
  const assignedIntervals = new Map<string, { start: string; end: string }[]>()

  const isEligible = (employeeId: string, shift: ShiftTemplateRow) => {
    if (!functionsByEmployee.get(employeeId)?.has(shift.function_id)) return false

    const avail = availabilityByEmployeeDay.get(`${employeeId}-${shift.day_of_week}`)
    if (!avail || !avail.is_available) return false
    if (!avail.is_all_day && (avail.start_time > shift.start_time || avail.end_time < shift.end_time)) {
      return false
    }

    const existing = assignedIntervals.get(`${employeeId}-${shift.day_of_week}`) ?? []
    return !existing.some((interval) =>
      overlaps(interval.start, interval.end, shift.start_time, shift.end_time)
    )
  }

  const orderedShifts = [...shifts].sort((a, b) => {
    const dayDiff = (dayRank.get(a.day_of_week) ?? 0) - (dayRank.get(b.day_of_week) ?? 0)
    if (dayDiff !== 0) return dayDiff
    return a.start_time.localeCompare(b.start_time)
  })

  const newRosterShifts: { roster_id: string; shift_template_id: string; employee_id: string | null }[] = []
  let filledSlots = 0
  let totalSlots = 0

  for (const shift of orderedShifts) {
    for (let slot = 0; slot < shift.capacity; slot++) {
      totalSlots++
      const employee = (employees ?? []).find((e) => isEligible(e.id, shift))

      if (employee) {
        const key = `${employee.id}-${shift.day_of_week}`
        const intervals = assignedIntervals.get(key) ?? []
        intervals.push({ start: shift.start_time, end: shift.end_time })
        assignedIntervals.set(key, intervals)
        filledSlots++
      }

      newRosterShifts.push({
        roster_id: roster.id,
        shift_template_id: shift.id,
        employee_id: employee?.id ?? null,
      })
    }
  }

  const { error: deleteError } = await supabase.from('roster_shifts').delete().eq('roster_id', roster.id)
  if (deleteError) {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  const { error: insertError } = await supabase.from('roster_shifts').insert(newRosterShifts)
  if (insertError) {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/schedule')
  return { status: 'success', filledSlots, totalSlots }
}

export async function updateRosterShiftAssignment(rosterShiftId: string, employeeId: string | null) {
  const supabase = await createClient()

  const { data: rosterShift } = await supabase
    .from('roster_shifts')
    .select('roster_id')
    .eq('id', rosterShiftId)
    .maybeSingle()
  if (!rosterShift) return

  const { data: roster } = await supabase
    .from('roster')
    .select('is_published')
    .eq('id', rosterShift.roster_id)
    .maybeSingle()
  // Published rosters are locked — the UI already disables editing, this is
  // the server-side backstop.
  if (roster?.is_published) return

  await supabase.from('roster_shifts').update({ employee_id: employeeId }).eq('id', rosterShiftId)
  revalidatePath('/manager/schedule')
}

export type PublishResult = { status: 'success' } | { status: 'error' }

export async function publishRoster(rosterId: string): Promise<PublishResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('roster').update({ is_published: true }).eq('id', rosterId)
  if (error) return { status: 'error' }

  revalidatePath('/manager/schedule')
  revalidatePath('/employee/schedule')
  return { status: 'success' }
}

export async function unpublishRoster(rosterId: string): Promise<PublishResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('roster').update({ is_published: false }).eq('id', rosterId)
  if (error) return { status: 'error' }

  revalidatePath('/manager/schedule')
  revalidatePath('/employee/schedule')
  return { status: 'success' }
}
