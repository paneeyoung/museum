'use client'

import { useActionState } from 'react'
import { copyShiftsToWeek, type CopyToWeekState } from './actions'
import WeekMultiSelect from './WeekMultiSelect'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: CopyToWeekState = { status: 'idle' }

export default function CopyToWeekForm({
  weekStartDate,
  weekOptions,
  dict,
}: {
  weekStartDate: string
  weekOptions: { value: string; label: string }[]
  dict: Dictionary
}) {
  const boundAction = copyShiftsToWeek.bind(null, weekStartDate)
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  return (
    <form action={formAction} className="flex flex-col items-start gap-2">
      <span className="text-xs text-gray-500">{dict.shifts.copyToWeekLabel}</span>

      <div className="flex items-center gap-2">
        <WeekMultiSelect name="targetWeek" options={weekOptions} dict={dict} />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50"
        >
          {dict.shifts.copyToWeekButton}
        </button>
      </div>

      {state.status === 'error' && state.errorCode && (
        <p className="text-sm text-red-600">{dict.shifts[state.errorCode]}</p>
      )}
      {state.status === 'success' && (
        <p className="text-sm text-green-700">
          {(state.skippedCount ?? 0) > 0
            ? dict.shifts.copyToWeekSuccessWithSkipped
                .replace('{copied}', String(state.copiedCount))
                .replace('{skipped}', String(state.skippedCount))
            : dict.shifts.copyToWeekSuccess.replace('{copied}', String(state.copiedCount))}
        </p>
      )}
    </form>
  )
}
