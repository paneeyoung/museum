'use client'

import { useActionState } from 'react'
import { updateEmployeeName, type UpdateEmployeeNameState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: UpdateEmployeeNameState = { status: 'idle' }

export default function EditNameForm({
  employeeId,
  fullName,
  dict,
}: {
  employeeId: string
  fullName: string
  dict: Dictionary
}) {
  const boundAction = updateEmployeeName.bind(null, employeeId)
  const [state, formAction, pending] = useActionState(boundAction, initialState)

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="fullName" className="text-xs text-gray-500">
          {dict.employees.nameColumn}
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          defaultValue={fullName}
          required
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {dict.availability.save}
      </button>
      {state.status === 'success' && (
        <span className="text-sm text-green-700">{dict.availability.saveSuccess}</span>
      )}
      {state.status === 'error' && state.errorCode && (
        <span className="text-sm text-red-600">{dict.employees[state.errorCode]}</span>
      )}
    </form>
  )
}
