'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AutoPlanState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const idleState: AutoPlanState = { status: 'idle' }

// AutoPlanButton is just one item in the button row's flex layout — it has
// no way to render its run-result message on its own line below the *whole*
// row without either widening its own flex item (the original bug) or
// floating detached from it (the follow-up bug). This bridges the button's
// client-side action state up to wherever the page wants to render it
// instead, the same way TopbarStatus bridges a page to the topbar.
const AutoPlanStatusContext = createContext<{
  state: AutoPlanState
  setState: (state: AutoPlanState) => void
} | null>(null)

export function AutoPlanStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AutoPlanState>(idleState)
  return <AutoPlanStatusContext.Provider value={{ state, setState }}>{children}</AutoPlanStatusContext.Provider>
}

// Called by AutoPlanButton to publish its latest action state.
export function usePublishAutoPlanState(state: AutoPlanState) {
  const ctx = useContext(AutoPlanStatusContext)
  useEffect(() => {
    ctx?.setState(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])
}

// Called wherever the page wants to render the latest run result.
export function useAutoPlanState(): AutoPlanState {
  const ctx = useContext(AutoPlanStatusContext)
  return ctx?.state ?? idleState
}

// Renders Auto-plan's error/success message on its own line, same
// container treatment as the neighboring noShiftsYet/noDraftYet notices —
// just border/text color swapped to match the message's severity.
export function AutoPlanRunStatus({ dict }: { dict: Dictionary }) {
  const state = useAutoPlanState()

  if (state.status === 'error' && state.errorCode) {
    return (
      <p className="mb-3 rounded-lg border border-red-200 p-3 text-sm text-red-600">
        {dict.schedule[state.errorCode]}
      </p>
    )
  }

  if (state.status === 'success') {
    return (
      <p className="mb-3 rounded-lg border border-green-200 p-3 text-sm text-green-700">
        {dict.schedule.slotsFilledSummary
          .replace('{filled}', String(state.filledSlots))
          .replace('{total}', String(state.totalSlots))}
      </p>
    )
  }

  return null
}
