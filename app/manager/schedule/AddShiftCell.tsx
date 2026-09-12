'use client'

import { useActionState, useEffect, useState } from 'react'
import { addShift, type AddShiftState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import TimeSelect from '@/app/components/TimeSelect'

const initialState: AddShiftState = { status: 'idle' }

// Lets a manager click an empty grid cell to add this row's shift on that
// specific day, instead of scrolling up to the standalone AddShiftForm and
// re-picking the day (and function) from dropdowns it already knows from
// context — day and function are fixed (hidden inputs); only the fields
// that plausibly differ per day (time, label, capacity) stay editable.
export default function AddShiftCell({
  weekStartDate,
  dayOfWeek,
  dayLabel,
  functionId,
  shiftName,
  defaultStartTime,
  defaultEndTime,
  defaultCapacity,
  dict,
}: {
  weekStartDate: string
  dayOfWeek: number
  dayLabel: string
  functionId: string
  shiftName: string
  defaultStartTime: string
  defaultEndTime: string
  defaultCapacity: number
  dict: Dictionary
}) {
  const [open, setOpen] = useState(false)
  const [state, formAction, pending] = useActionState(addShift, initialState)

  useEffect(() => {
    if (state.status === 'success') setOpen(false)
  }, [state])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={dict.schedule.addShiftHint}
        className="flex h-full min-h-11 w-full items-center justify-center rounded text-xl text-gray-300 hover:bg-gray-100 hover:text-gray-500 active:bg-gray-200 print:hidden"
      >
        +
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={() => setOpen(false)}
        >
          <form
            action={formAction}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-3 rounded-lg bg-white p-4 shadow-lg"
          >
            <input type="hidden" name="weekStartDate" value={weekStartDate} />
            <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
            <input type="hidden" name="functionId" value={functionId} />

            <p className="text-left text-sm font-medium text-gray-900">{dayLabel}</p>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-gray-500">{dict.shifts.startLabel}</label>
                <TimeSelect name="startTime" defaultValue={defaultStartTime.slice(0, 5)} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-gray-500">{dict.shifts.endLabel}</label>
                <TimeSelect name="endTime" defaultValue={defaultEndTime.slice(0, 5)} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.labelLabel}</label>
              <input
                type="text"
                name="label"
                defaultValue={shiftName}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.capacityLabel}</label>
              <input
                type="number"
                name="capacity"
                min={1}
                defaultValue={defaultCapacity}
                required
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {dict.shifts.addButton}
              </button>
              <button type="button" onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:underline">
                {dict.availability.copyCancel}
              </button>
            </div>

            {state.status === 'error' && state.errorCode && (
              <p className="text-sm text-red-600">{dict.shifts[state.errorCode]}</p>
            )}
          </form>
        </div>
      )}
    </>
  )
}
