'use client'

import { useActionState, useState } from 'react'
import { addShift, type AddShiftState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { WEEK_DISPLAY_ORDER } from '@/lib/weeks'
import TimeSelect from '@/app/components/TimeSelect'
import DayMultiSelect from './DayMultiSelect'

const initialState: AddShiftState = { status: 'idle' }

// The wrapper classes below implement one pattern shared with
// CopyToWeekForm: on md+ screens they collapse to nothing, so the form
// renders inline exactly as before; below md they turn the form into a
// centered overlay that only mounts visibly while `isOpen` is true, opened
// via the mobile-only button rendered alongside it. Same single <form> and
// state either way — just redisplayed, not duplicated.
const mobileModalWrapperClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 md:static md:z-auto md:block md:bg-transparent md:p-0'
const mobileModalCardClass =
  'w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg md:max-w-none md:max-h-none md:overflow-visible md:rounded-none md:bg-transparent md:p-0 md:shadow-none'

export default function AddShiftForm({
  weekStartDate,
  functions,
  dict,
}: {
  weekStartDate: string
  functions: { id: string; name: string }[]
  dict: Dictionary
}) {
  const [state, formAction, pending] = useActionState(addShift, initialState)
  const [isOpen, setIsOpen] = useState(false)

  // Clear the form after a successful add by forcing it to remount, since
  // this Next.js version doesn't reset uncontrolled form fields automatically.
  // Also close the mobile popup (if it was open) once the shift is added.
  const [appliedState, setAppliedState] = useState(state)
  const [resetKey, setResetKey] = useState(0)
  if (state !== appliedState) {
    setAppliedState(state)
    if (state.status === 'success') {
      setResetKey((k) => k + 1)
      setIsOpen(false)
    }
  }

  const dayNames = dict.common.dayNames

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white md:hidden"
      >
        + {dict.shifts.addButton}
      </button>

      <div
        className={isOpen ? mobileModalWrapperClass : 'hidden md:block'}
        onClick={isOpen ? () => setIsOpen(false) : undefined}
      >
        <div onClick={isOpen ? (e) => e.stopPropagation() : undefined} className={isOpen ? mobileModalCardClass : ''}>
          <form key={resetKey} action={formAction} className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
            <input type="hidden" name="weekStartDate" value={weekStartDate} />

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.dayLabel}</label>
              <DayMultiSelect
                name="dayOfWeek"
                options={WEEK_DISPLAY_ORDER.map((dayOfWeek) => ({ value: dayOfWeek, label: dayNames[dayOfWeek] }))}
                dict={dict}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.startLabel}</label>
              <TimeSelect name="startTime" defaultValue="09:00" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.endLabel}</label>
              <TimeSelect name="endTime" defaultValue="17:00" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.labelLabel}</label>
              <input
                type="text"
                name="label"
                placeholder={dict.shifts.labelPlaceholder}
                required
                className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.capacityLabel}</label>
              <input
                type="number"
                name="capacity"
                min={1}
                defaultValue={1}
                required
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.functionLabel}</label>
              <select
                name="functionId"
                required
                defaultValue=""
                className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-black focus:outline-none"
              >
                <option value="" disabled>
                  —
                </option>
                {functions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {dict.shifts.addButton}
              </button>
              {isOpen && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-500 hover:underline md:hidden"
                >
                  {dict.availability.copyCancel}
                </button>
              )}
            </div>

            {state.status === 'error' && state.errorCode && (
              <p className="w-full text-sm text-red-600">{dict.shifts[state.errorCode]}</p>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
