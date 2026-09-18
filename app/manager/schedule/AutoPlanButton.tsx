'use client'

import { useActionState } from 'react'
import { runAutoPlan, type AutoPlanState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: AutoPlanState = { status: 'idle' }

function WandIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h.01M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" />
    </svg>
  )
}

export default function AutoPlanButton({
  weekStartDate,
  hasExistingDraft,
  disabled,
  dict,
}: {
  weekStartDate: string
  hasExistingDraft: boolean
  disabled?: boolean
  dict: Dictionary
}) {
  const boundAction = runAutoPlan.bind(null, weekStartDate)
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (hasExistingDraft && !window.confirm(dict.schedule.autoPlanConfirmOverwrite)) {
          e.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        disabled={pending || disabled}
        className="flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
      >
        <WandIcon />
        {pending ? dict.schedule.autoPlanRunning : dict.schedule.autoPlanButton}
      </button>

      {disabled && <p className="mt-2 text-sm text-gray-500">{dict.schedule.lockedNotice}</p>}
      {state.status === 'error' && state.errorCode && (
        <p className="mt-2 text-sm text-red-600">{dict.schedule[state.errorCode]}</p>
      )}
      {state.status === 'success' && (
        <p className="mt-2 text-sm text-green-700">
          {dict.schedule.slotsFilledSummary
            .replace('{filled}', String(state.filledSlots))
            .replace('{total}', String(state.totalSlots))}
        </p>
      )}
    </form>
  )
}
