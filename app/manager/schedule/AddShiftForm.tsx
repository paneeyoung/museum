'use client'

import { useActionState, useState } from 'react'
import { addShift, type AddShiftState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { WEEK_DISPLAY_ORDER } from '@/lib/weeks'
import TimeSelect from '@/app/components/TimeSelect'

const initialState: AddShiftState = { status: 'idle' }

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

  // Clear the form after a successful add by forcing it to remount, since
  // this Next.js version doesn't reset uncontrolled form fields automatically.
  const [appliedState, setAppliedState] = useState(state)
  const [resetKey, setResetKey] = useState(0)
  if (state !== appliedState) {
    setAppliedState(state)
    if (state.status === 'success') setResetKey((k) => k + 1)
  }

  const dayNames = dict.common.dayNames

  return (
    <form key={resetKey} action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="weekStartDate" value={weekStartDate} />

      <div className="flex flex-col gap-1">
        <label className="text-xs text-gray-500">{dict.shifts.dayLabel}</label>
        <select
          name="dayOfWeek"
          required
          defaultValue=""
          className="rounded-md border border-gray-300 px-2 py-2 text-sm focus:border-black focus:outline-none"
        >
          <option value="" disabled>
            —
          </option>
          {WEEK_DISPLAY_ORDER.map((dayOfWeek) => (
            <option key={dayOfWeek} value={dayOfWeek}>
              {dayNames[dayOfWeek]}
            </option>
          ))}
        </select>
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

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {dict.shifts.addButton}
      </button>

      {state.status === 'error' && state.errorCode && (
        <p className="w-full text-sm text-red-600">{dict.shifts[state.errorCode]}</p>
      )}
    </form>
  )
}
