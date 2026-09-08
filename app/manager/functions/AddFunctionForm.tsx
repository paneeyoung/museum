'use client'

import { useActionState, useState } from 'react'
import { addFunction, type AddFunctionState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: AddFunctionState = { status: 'idle' }

export default function AddFunctionForm({ dict }: { dict: Dictionary }) {
  const [state, formAction, pending] = useActionState(addFunction, initialState)

  // Clear the input after a successful add by forcing it to remount, since
  // this Next.js version doesn't reset uncontrolled form fields automatically.
  const [appliedState, setAppliedState] = useState(state)
  const [resetKey, setResetKey] = useState(0)
  if (state !== appliedState) {
    setAppliedState(state)
    if (state.status === 'success') setResetKey((k) => k + 1)
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="function-name" className="text-sm text-gray-700">
          {dict.functions.nameLabel}
        </label>
        <input
          key={resetKey}
          id="function-name"
          type="text"
          name="name"
          placeholder={dict.functions.namePlaceholder}
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {dict.functions.addButton}
      </button>
      {state.status === 'error' && state.errorCode && (
        <p className="text-sm text-red-600">{dict.functions[state.errorCode]}</p>
      )}
    </form>
  )
}
