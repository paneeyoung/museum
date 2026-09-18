'use client'

import { useActionState, useState } from 'react'
import { copyShiftsToWeek, type CopyMode, type CopyToWeekState } from './actions'
import WeekMultiSelect from './WeekMultiSelect'
import Tooltip from '@/app/components/Tooltip'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: CopyToWeekState = { status: 'idle' }

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
      <rect x="7" y="7" width="9" height="9" rx="1.5" />
      <path d="M4.5 12.5v-7A1.5 1.5 0 0 1 6 4h7" />
    </svg>
  )
}

// Same always-a-modal pattern as AddShiftForm.
const modalWrapperClass = 'fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4'
const modalCardClass = 'w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-lg bg-white p-4 shadow-lg'

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

  // WeekMultiSelect keeps its own checked-weeks state internally, so simply
  // unmounting/remounting the modal isn't guaranteed to clear it (e.g. a
  // bfcache-restored page keeps the whole component tree, selection
  // included). Force a fresh instance — and therefore an empty
  // selection — every time the modal is opened.
  const [openKey, setOpenKey] = useState(0)
  function openModal() {
    setOpenKey((k) => k + 1)
    setIsOpen(true)
  }

  // Close the mobile popup (if it was open) once a copy completes
  // successfully — mirrors AddShiftForm's reset-on-success handling.
  const [appliedState, setAppliedState] = useState(state)
  if (state !== appliedState) {
    setAppliedState(state)
    if (state.status === 'success') setIsOpen(false)
  }

  return (
    <>
      <Tooltip text={dict.shifts.copyToWeekMobileButton}>
        <button
          type="button"
          onClick={openModal}
          className="flex items-center gap-2 rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50"
        >
          <CopyIcon />
          {dict.shifts.copyToWeekShortButton}
        </button>
      </Tooltip>

      {isOpen && (
        <div className={modalWrapperClass} onClick={() => setIsOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} className={modalCardClass}>
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
                <WeekMultiSelect key={openKey} name="targetWeek" options={weekOptions} dict={dict} />
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

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-500 hover:underline"
              >
                {dict.availability.copyCancel}
              </button>

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
      )}
    </>
  )
}
