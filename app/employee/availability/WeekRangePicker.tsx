'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'
import {
  addDays,
  addWeeks,
  formatMonthYearLabel,
  formatWeekRangeLabel,
  MAX_REPEAT_WEEKS,
  parseISODate,
  startOfWeek,
  toISODate,
} from '@/lib/weeks'

function getWeekRows(viewMonth: Date): Date[] {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1)
  const last = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0)
  const gridStart = startOfWeek(first)
  const gridEnd = startOfWeek(last)

  const rows: Date[] = []
  let cursor = gridStart
  while (cursor.getTime() <= gridEnd.getTime()) {
    rows.push(cursor)
    cursor = addWeeks(cursor, 1)
  }
  return rows
}

export default function WeekRangePicker({
  name,
  minWeekStartDate,
  locale,
  dict,
}: {
  name: string
  minWeekStartDate: string
  locale: Locale
  dict: Dictionary
}) {
  const minDate = useMemo(() => parseISODate(minWeekStartDate), [minWeekStartDate])
  const maxWeekStartDate = useMemo(
    () => toISODate(addWeeks(minDate, MAX_REPEAT_WEEKS - 1)),
    [minDate]
  )

  const [selectedWeekStart, setSelectedWeekStart] = useState(minWeekStartDate)
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState(
    () => new Date(minDate.getFullYear(), minDate.getMonth(), 1)
  )
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const weekdayShort = dict.common.dayNames.map((d) => d.slice(0, 2))
  const rows = useMemo(() => getWeekRows(viewMonth), [viewMonth])

  function openPicker() {
    const anchor = parseISODate(selectedWeekStart)
    setViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1))
    setOpen(true)
  }

  function handleSelect(weekStartISO: string) {
    setSelectedWeekStart(weekStartISO)
    setOpen(false)
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <input type="hidden" name={name} value={selectedWeekStart} />

      <div className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">{dict.availability.startWeekLabel}</span>
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
          {formatWeekRangeLabel(minDate, locale)}
        </div>
      </div>

      <span className="hidden pb-2 text-gray-400 sm:block">→</span>

      <div className="relative flex flex-col gap-1" ref={containerRef}>
        <span className="text-xs text-gray-500">{dict.availability.endWeekLabel}</span>
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : openPicker())}
          className="rounded-md border border-gray-300 px-3 py-2 text-left text-sm hover:border-gray-400 focus:border-black focus:outline-none"
        >
          {formatWeekRangeLabel(parseISODate(selectedWeekStart), locale)}
        </button>

        {open && (
          <div className="absolute top-full z-10 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label={dict.availability.prevMonth}
                onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                ‹
              </button>
              <span className="text-sm font-medium text-gray-900">
                {formatMonthYearLabel(viewMonth, locale)}
              </span>
              <button
                type="button"
                aria-label={dict.availability.nextMonth}
                onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
              >
                ›
              </button>
            </div>

            <div className="mb-1 flex text-center text-xs text-gray-400">
              {weekdayShort.map((label, i) => (
                <span key={i} className="flex-1">
                  {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-0.5">
              {rows.map((weekStart) => {
                const weekStartISO = toISODate(weekStart)
                const isSelected = weekStartISO === selectedWeekStart
                const isDisabled = weekStartISO < minWeekStartDate || weekStartISO > maxWeekStartDate
                const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

                return (
                  <button
                    type="button"
                    key={weekStartISO}
                    disabled={isDisabled}
                    onClick={() => handleSelect(weekStartISO)}
                    className={[
                      'flex items-center rounded-full px-1 py-1.5 text-sm transition-colors',
                      isSelected
                        ? 'bg-black text-white'
                        : isDisabled
                          ? 'cursor-not-allowed text-gray-300'
                          : 'text-gray-700 hover:bg-gray-100',
                    ].join(' ')}
                  >
                    {days.map((d) => {
                      const sameMonth = d.getMonth() === viewMonth.getMonth()
                      return (
                        <span
                          key={d.getTime()}
                          className={[
                            'flex-1 text-center',
                            !isSelected && !sameMonth ? 'text-gray-300' : '',
                          ].join(' ')}
                        >
                          {d.getDate()}
                        </span>
                      )
                    })}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
