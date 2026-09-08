'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addWeeks, MAX_REPEAT_WEEKS, parseISODate, startOfWeek, toISODate } from '@/lib/weeks'
import type { AvailabilityDayState } from './AvailabilityForm'

export type AvailabilityErrorCode =
  | 'errorSessionExpired'
  | 'errorNoWeekSelected'
  | 'errorMissingTimes'
  | 'errorStartBeforeEnd'
  | 'errorGeneric'

export type SavedDay = {
  dayOfWeek: number
  state: AvailabilityDayState
  startTime?: string
  endTime?: string
}

export type SaveAvailabilityState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: AvailabilityErrorCode
  dayOfWeek?: number
  summary?: SavedDay[]
  weeksSaved?: number
  firstWeekStartDate?: string
  lastWeekStartDate?: string
}

type DayPatternEntry = {
  dayOfWeek: number
  state: AvailabilityDayState
  startTime: string
  endTime: string
}

export async function saveAvailability(
  _prevState: SaveAvailabilityState,
  formData: FormData
): Promise<SaveAvailabilityState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { status: 'error', errorCode: 'errorSessionExpired' }
  }

  const weekStartDate = formData.get('weekStartDate')
  if (typeof weekStartDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(weekStartDate)) {
    return { status: 'error', errorCode: 'errorNoWeekSelected' }
  }

  const baseWeekStart = parseISODate(weekStartDate)

  const repeatUntilRaw = formData.get('repeatUntil')
  let repeatWeeks = 1
  if (typeof repeatUntilRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(repeatUntilRaw)) {
    const untilWeekStart = startOfWeek(parseISODate(repeatUntilRaw))
    const diffWeeks =
      Math.round((untilWeekStart.getTime() - baseWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1
    repeatWeeks = Math.min(Math.max(diffWeeks, 1), MAX_REPEAT_WEEKS)
  }

  const dayPattern: DayPatternEntry[] = []
  for (let day = 0; day < 7; day++) {
    const stateRaw = formData.get(`available-${day}`)
    const state: AvailabilityDayState =
      stateRaw === 'allDay' || stateRaw === 'specific' ? stateRaw : 'unavailable'

    if (state === 'unavailable') {
      dayPattern.push({ dayOfWeek: day, state, startTime: '00:00', endTime: '00:00' })
      continue
    }

    if (state === 'allDay') {
      dayPattern.push({ dayOfWeek: day, state, startTime: '00:00', endTime: '23:59' })
      continue
    }

    const startTime = formData.get(`start-${day}`)
    const endTime = formData.get(`end-${day}`)

    if (typeof startTime !== 'string' || typeof endTime !== 'string' || !startTime || !endTime) {
      return { status: 'error', errorCode: 'errorMissingTimes', dayOfWeek: day }
    }
    if (startTime >= endTime) {
      return { status: 'error', errorCode: 'errorStartBeforeEnd', dayOfWeek: day }
    }

    dayPattern.push({ dayOfWeek: day, state, startTime, endTime })
  }

  const rows = []
  for (let weekOffset = 0; weekOffset < repeatWeeks; weekOffset++) {
    const targetWeekStartDate = toISODate(addWeeks(baseWeekStart, weekOffset))
    for (const day of dayPattern) {
      rows.push({
        employee_id: user.id,
        week_start_date: targetWeekStartDate,
        day_of_week: day.dayOfWeek,
        is_available: day.state !== 'unavailable',
        is_all_day: day.state === 'allDay',
        start_time: day.startTime,
        end_time: day.endTime,
      })
    }
  }

  const { error } = await supabase
    .from('availability')
    .upsert(rows, { onConflict: 'employee_id,week_start_date,day_of_week' })

  if (error) {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/employee/availability')
  return {
    status: 'success',
    summary: dayPattern.map((day) => ({
      dayOfWeek: day.dayOfWeek,
      state: day.state,
      startTime: day.state === 'specific' ? day.startTime : undefined,
      endTime: day.state === 'specific' ? day.endTime : undefined,
    })),
    weeksSaved: repeatWeeks,
    firstWeekStartDate: weekStartDate,
    lastWeekStartDate: toISODate(addWeeks(baseWeekStart, repeatWeeks - 1)),
  }
}
