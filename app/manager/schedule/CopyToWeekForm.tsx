'use client'

import { useActionState, useState } from 'react'
import { copyShiftsToWeek, type CopyMode, type CopyToWeekState } from './actions'
import WeekMultiSelect from './WeekMultiSelect'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: CopyToWeekState = { status: 'idle' }

// Same mobile-collapses-to-a-modal pattern as AddShiftForm — see the
// comment there for why the wrapper classes are structured this way.
const mobileModalWrapperClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4 md:static md:z-auto md:block md:bg-transparent md:p-0'
const mobileModalCardClass =
  'w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg md:max-w-none md:max-h-none md:overflow-visible md:rounded-none md:bg-transparent md:p-0 md:shadow-none'

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
  const [mode, setMode] = useState<CopyMode>('merge')
  const [isOpen, setIsOpen] = useState(false)

  // Close the mobile popup (if it was open) once a copy completes
  // successfully — mirrors AddShiftForm's reset-on-success handling.
  const [appliedState, setAppliedState] = useState(state)
  if (state !== appliedState) {
    setAppliedState(state)
    if (state.status === 'success') setIsOpen(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 md:hidden"
      >
        {dict.shifts.copyToWeekMobileButton}
      </button>

      <div
        className={isOpen ? mobileModalWrapperClass : 'hidden md:block'}
        onClick={isOpen ? () => setIsOpen(false) : undefined}
      >
        <div onClick={isOpen ? (e) => e.stopPropagation() : undefined} className={isOpen ? mobileModalCardClass : ''}>
          <form
            action={formAction}
            onSubmit={(e) => {
              if (mode === 'overwrite' && !window.confirm(dict.shifts.copyModeOverwriteConfirm)) {
                e.preventDefault()
              }
            }}
            className="flex flex-col items-start gap-2"
          >
            <span className="text-xs text-gray-500">{dict.shifts.copyToWeekLabel}</span>

            <div className="flex flex-wrap items-center gap-2">
              <WeekMultiSelect name="targetWeek" options={weekOptions} dict={dict} />
              <button
                type="submit"
                disabled={pending}
                className="rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50"
              >
                {dict.shifts.copyToWeekButton}
              </button>
            </div>

            <fieldset className="flex flex-col gap-1">
              <legend className="text-xs text-gray-500">{dict.shifts.copyModeLabel}</legend>
              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="radio"
                  name="copyMode"
                  value="merge"
                  checked={mode === 'merge'}
                  onChange={() => setMode('merge')}
                />
                {dict.shifts.copyModeMerge}
              </label>
              <label className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="radio"
                  name="copyMode"
                  value="overwrite"
                  checked={mode === 'overwrite'}
                  onChange={() => setMode('overwrite')}
                />
                {dict.shifts.copyModeOverwrite}
              </label>
            </fieldset>

            {isOpen && (
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:underline md:hidden"
              >
                {dict.availability.copyCancel}
              </button>
            )}

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
        </div>
      </div>
    </>
  )
}
