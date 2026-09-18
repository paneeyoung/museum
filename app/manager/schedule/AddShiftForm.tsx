'use client'

import { useActionState, useState } from 'react'
import { addShift, type AddShiftState } from './actions'
import Tooltip from '@/app/components/Tooltip'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { WEEK_DISPLAY_ORDER } from '@/lib/weeks'
import TimeSelect from '@/app/components/TimeSelect'
import DayMultiSelect from './DayMultiSelect'

const initialState: AddShiftState = { status: 'idle' }

const modalWrapperClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4'
const modalCardClass = 'w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg'

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
    </svg>
  )
}

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
  // Also close the modal (if it was open) once the shift is added.
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
      <Tooltip text={dict.shifts.addButton}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
        >
          <PlusIcon />
          {dict.shifts.addButtonShort}
        </button>
      </Tooltip>

      {isOpen && (
        <div className={modalWrapperClass} onClick={() => setIsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className={modalCardClass}>
            <form key={resetKey} action={formAction} className="flex flex-col gap-3">
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
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-gray-500 hover:underline"
                >
                  {dict.availability.copyCancel}
                </button>
              </div>

              {state.status === 'error' && state.errorCode && (
                <p className="w-full text-sm text-red-600">{dict.shifts[state.errorCode]}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}
