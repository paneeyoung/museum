'use client'

import { useActionState, useState } from 'react'
import { saveAvailability, type SaveAvailabilityState } from './actions'
import WeekRangePicker from './WeekRangePicker'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'
import { formatDayLabel, parseISODate, WEEK_DISPLAY_ORDER } from '@/lib/weeks'
import TimeSelect from '@/app/components/TimeSelect'

export type AvailabilityDayState = 'unavailable' | 'allDay' | 'specific'

export const DEFAULT_START_TIME = '09:00'
export const DEFAULT_END_TIME = '17:00'

export type DayAvailability = {
  dayOfWeek: number
  dateLabel: string
  state: AvailabilityDayState
  startTime: string
  endTime: string
}

const initialState: SaveAvailabilityState = { status: 'idle' }

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path d="M6.4 5 5 6.4 8.6 10 5 13.6 6.4 15 10 11.4 13.6 15 15 13.6 11.4 10 15 6.4 13.6 5 10 8.6 6.4 5Z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="7" y="7" width="9" height="9" rx="1.5" />
      <path d="M4.5 12.5v-7A1.5 1.5 0 0 1 6 4h7" />
    </svg>
  )
}

export default function AvailabilityForm({
  weekStartDate,
  days,
  dict,
  locale,
}: {
  weekStartDate: string
  days: DayAvailability[]
  dict: Dictionary
  locale: Locale
}) {
  const [state, formAction, pending] = useActionState(saveAvailability, initialState)
  const [dayStates, setDayStates] = useState<AvailabilityDayState[]>(days.map((d) => d.state))
  const [startTimes, setStartTimes] = useState<string[]>(days.map((d) => d.startTime))
  const [endTimes, setEndTimes] = useState<string[]>(days.map((d) => d.endTime))
  const [copyMenuDay, setCopyMenuDay] = useState<number | null>(null)
  const [copyTargets, setCopyTargets] = useState<Set<number>>(new Set())
  const dayNames = dict.common.dayNames
  const stateLabels: Record<AvailabilityDayState, string> = {
    unavailable: dict.availability.unavailable,
    allDay: dict.availability.allDay,
    specific: dict.availability.specific,
  }

  // Re-sync the displayed values from the just-saved data, in case the summary
  // (e.g. a day pinned to a different value by a wider repeat range) differs
  // from what's currently shown.
  const [appliedState, setAppliedState] = useState(state)
  if (state !== appliedState) {
    setAppliedState(state)
    if (state.status === 'success' && state.summary) {
      const summary = state.summary
      setDayStates((prev) => {
        const next = [...prev]
        for (const day of summary) next[day.dayOfWeek] = day.state
        return next
      })
      setStartTimes((prev) => {
        const next = [...prev]
        for (const day of summary) if (day.startTime) next[day.dayOfWeek] = day.startTime
        return next
      })
      setEndTimes((prev) => {
        const next = [...prev]
        for (const day of summary) if (day.endTime) next[day.dayOfWeek] = day.endTime
        return next
      })
    }
  }

  function setAvailable(day: number, available: boolean) {
    const wasUnavailable = dayStates[day] === 'unavailable'
    setDayStates((prev) => {
      const next = [...prev]
      next[day] = available ? (prev[day] === 'unavailable' ? 'allDay' : prev[day]) : 'unavailable'
      return next
    })
    if (available && wasUnavailable) {
      setStartTimes((prev) => {
        const next = [...prev]
        next[day] = DEFAULT_START_TIME
        return next
      })
      setEndTimes((prev) => {
        const next = [...prev]
        next[day] = DEFAULT_END_TIME
        return next
      })
    }
  }

  function setHoursType(day: number, hoursType: 'allDay' | 'specific') {
    setDayStates((prev) => {
      const next = [...prev]
      next[day] = hoursType
      return next
    })
    if (hoursType === 'allDay') {
      setStartTimes((prev) => {
        const next = [...prev]
        next[day] = DEFAULT_START_TIME
        return next
      })
      setEndTimes((prev) => {
        const next = [...prev]
        next[day] = DEFAULT_END_TIME
        return next
      })
    }
  }

  function openCopyMenu(day: number) {
    setCopyMenuDay(day)
    setCopyTargets(new Set())
  }

  function toggleCopyTarget(day: number) {
    setCopyTargets((prev) => {
      const next = new Set(prev)
      if (next.has(day)) next.delete(day)
      else next.add(day)
      return next
    })
  }

  function applyCopy() {
    if (copyMenuDay === null) return
    const sourceState = dayStates[copyMenuDay]
    const sourceStart = startTimes[copyMenuDay]
    const sourceEnd = endTimes[copyMenuDay]
    setDayStates((prev) => prev.map((s, i) => (copyTargets.has(i) ? sourceState : s)))
    setStartTimes((prev) => prev.map((t, i) => (copyTargets.has(i) ? sourceStart : t)))
    setEndTimes((prev) => prev.map((t, i) => (copyTargets.has(i) ? sourceEnd : t)))
    setCopyMenuDay(null)
  }

  return (
    <form action={formAction} autoComplete="off" className="space-y-4">
      <input type="hidden" name="weekStartDate" value={weekStartDate} />

      <div className="divide-y divide-gray-200 rounded-lg border border-gray-200">
        {days.map((day) => {
          const dayState = dayStates[day.dayOfWeek]
          const available = dayState !== 'unavailable'
          const expanded = dayState === 'specific'
          return (
            <div
              key={day.dayOfWeek}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex items-center gap-2 sm:w-32">
                <div className="relative shrink-0">
                  <button
                    type="button"
                    title={dict.availability.copyToOtherDays}
                    aria-label={dict.availability.copyToOtherDays}
                    onClick={() => (copyMenuDay === day.dayOfWeek ? setCopyMenuDay(null) : openCopyMenu(day.dayOfWeek))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50"
                  >
                    <CopyIcon />
                  </button>

                  {copyMenuDay === day.dayOfWeek && (
                    <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-lg">
                      <p className="mb-2 text-gray-500">
                        {dayNames[day.dayOfWeek]}:{' '}
                        <span className="font-medium text-gray-700">
                          {dayState === 'specific'
                            ? `${startTimes[day.dayOfWeek]} ${dict.common.to} ${endTimes[day.dayOfWeek]}`
                            : stateLabels[dayState]}
                        </span>
                      </p>
                      <p className="mb-2 font-medium text-gray-700">{dict.availability.copySelectDaysLabel}</p>
                      <div className="space-y-1">
                        {days
                          .filter((d) => d.dayOfWeek !== day.dayOfWeek)
                          .map((d) => (
                            <label key={d.dayOfWeek} className="flex items-center gap-2 text-gray-700">
                              <input
                                type="checkbox"
                                checked={copyTargets.has(d.dayOfWeek)}
                                onChange={() => toggleCopyTarget(d.dayOfWeek)}
                              />
                              {dayNames[d.dayOfWeek]}
                            </label>
                          ))}
                      </div>
                      <div className="mt-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setCopyMenuDay(null)}
                          className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-50"
                        >
                          {dict.availability.copyCancel}
                        </button>
                        <button
                          type="button"
                          onClick={applyCopy}
                          disabled={copyTargets.size === 0}
                          className="rounded-md bg-black px-3 py-1 text-white disabled:opacity-40"
                        >
                          {dict.availability.copyApply}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-medium text-gray-900">{dayNames[day.dayOfWeek]}</p>
                  <p className="text-xs text-gray-500">{day.dateLabel}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div role="group" aria-label={dict.availability.availableLabel} className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={available}
                    title={dict.availability.availableLabel}
                    onClick={() => setAvailable(day.dayOfWeek, true)}
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
                      available
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 text-gray-400 hover:border-green-400 hover:text-green-600',
                    ].join(' ')}
                  >
                    <CheckIcon />
                  </button>
                  <button
                    type="button"
                    aria-pressed={!available}
                    title={dict.availability.unavailable}
                    onClick={() => setAvailable(day.dayOfWeek, false)}
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-full border transition-colors',
                      !available
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-600',
                    ].join(' ')}
                  >
                    <XIcon />
                  </button>

                  <input type="hidden" name={`available-${day.dayOfWeek}`} value={dayState} readOnly />
                </div>

                {available && (
                  <div
                    role="group"
                    aria-label={dict.availability.hoursType}
                    className="flex overflow-hidden rounded-md border border-gray-300 text-sm"
                  >
                    <button
                      type="button"
                      aria-pressed={dayState !== 'specific'}
                      onClick={() => setHoursType(day.dayOfWeek, 'allDay')}
                      className={[
                        'px-3 py-2 transition-colors',
                        dayState !== 'specific'
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {dict.availability.allDayOption}
                    </button>
                    <button
                      type="button"
                      aria-pressed={dayState === 'specific'}
                      onClick={() => setHoursType(day.dayOfWeek, 'specific')}
                      className={[
                        'border-l border-gray-300 px-3 py-2 transition-colors',
                        dayState === 'specific'
                          ? 'bg-black text-white'
                          : 'text-gray-700 hover:bg-gray-50',
                      ].join(' ')}
                    >
                      {dict.availability.specificOption}
                    </button>
                  </div>
                )}

                {expanded && (
                  <div className="flex items-center gap-2">
                    <TimeSelect
                      name={`start-${day.dayOfWeek}`}
                      value={startTimes[day.dayOfWeek]}
                      onChange={(value) =>
                        setStartTimes((prev) => {
                          const next = [...prev]
                          next[day.dayOfWeek] = value
                          return next
                        })
                      }
                    />
                    <span className="text-sm text-gray-500">{dict.common.to}</span>
                    <TimeSelect
                      name={`end-${day.dayOfWeek}`}
                      value={endTimes[day.dayOfWeek]}
                      onChange={(value) =>
                        setEndTimes((prev) => {
                          const next = [...prev]
                          next[day.dayOfWeek] = value
                          return next
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-gray-700">{dict.availability.repeatLabel}</span>
        <WeekRangePicker
          key={weekStartDate}
          name="repeatUntil"
          minWeekStartDate={weekStartDate}
          locale={locale}
          dict={dict}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? dict.availability.saving : dict.availability.save}
        </button>
        {state.status === 'error' && state.errorCode && (
          <p className="text-sm text-red-600">
            {dict.availability[state.errorCode]}
            {state.errorCode === 'errorStartBeforeEnd' &&
              state.dayOfWeek !== undefined &&
              ` (${dayNames[state.dayOfWeek]})`}
          </p>
        )}
      </div>

      {state.status === 'success' && state.summary && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-900">
          <p className="font-medium">{dict.availability.savedSummaryIntro}</p>
          {state.weeksSaved && state.weeksSaved > 1 && state.firstWeekStartDate && state.lastWeekStartDate && (
            <p className="mt-1 text-green-800">
              {dict.availability.appliedToWeeks} {state.weeksSaved} {dict.availability.weeksSuffix} (
              {formatDayLabel(parseISODate(state.firstWeekStartDate), locale)} –{' '}
              {formatDayLabel(parseISODate(state.lastWeekStartDate), locale)})
            </p>
          )}
          <ul className="mt-2 space-y-1">
            {WEEK_DISPLAY_ORDER.map((dayOfWeek) => {
              const day = state.summary!.find((d) => d.dayOfWeek === dayOfWeek)
              if (!day) return null
              return (
                <li key={day.dayOfWeek}>
                  <span className="font-medium">{dayNames[day.dayOfWeek]}:</span>{' '}
                  {day.state === 'specific'
                    ? `${day.startTime} ${dict.common.to} ${day.endTime}`
                    : stateLabels[day.state]}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </form>
  )
}
