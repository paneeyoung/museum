'use client'

import { useTransition } from 'react'
import { moveFunction } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M10 3.75a.75.75 0 0 1 .53.22l4.5 4.5a.75.75 0 1 1-1.06 1.06L10.75 6.31v9.44a.75.75 0 0 1-1.5 0V6.31L6.03 9.53a.75.75 0 0 1-1.06-1.06l4.5-4.5a.75.75 0 0 1 .53-.22Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
      <path
        fillRule="evenodd"
        d="M10 16.25a.75.75 0 0 1-.53-.22l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3.25a.75.75 0 0 1 1.5 0v10.44l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-.53.22Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function FunctionReorderButtons({
  functionId,
  disableUp,
  disableDown,
  dict,
}: {
  functionId: string
  disableUp: boolean
  disableDown: boolean
  dict: Dictionary
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col print:hidden">
      <button
        type="button"
        onClick={() => startTransition(() => moveFunction(functionId, 'up'))}
        disabled={isPending || disableUp}
        title={dict.functions.moveUpHint}
        aria-label={dict.functions.moveUpHint}
        className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
      >
        <ArrowUpIcon />
      </button>
      <button
        type="button"
        onClick={() => startTransition(() => moveFunction(functionId, 'down'))}
        disabled={isPending || disableDown}
        title={dict.functions.moveDownHint}
        aria-label={dict.functions.moveDownHint}
        className="text-gray-400 hover:text-gray-700 disabled:opacity-30"
      >
        <ArrowDownIcon />
      </button>
    </div>
  )
}
