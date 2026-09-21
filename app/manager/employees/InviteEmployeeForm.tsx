'use client'

import { useActionState, useEffect, useRef } from 'react'
import { inviteEmployee, type InviteEmployeeState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: InviteEmployeeState = { status: 'idle' }

export default function InviteEmployeeForm({
  functions,
  dict,
}: {
  functions: { id: string; name: string }[]
  dict: Dictionary
}) {
  const [state, formAction, pending] = useActionState(inviteEmployee, initialState)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md">
      <h2 className="text-sm font-medium text-gray-900">{dict.employees.inviteTitle}</h2>

      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-xs text-gray-500">
            {dict.employees.nameColumn}
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-xs text-gray-500">
            {dict.employees.emailColumn}
          </label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="role" className="text-xs text-gray-500">
            {dict.employees.roleColumn}
          </label>
          <select
            id="role"
            name="role"
            defaultValue="employee"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          >
            <option value="employee">{dict.employees.roleEmployee}</option>
            <option value="manager">{dict.employees.roleManager}</option>
          </select>
        </div>
      </div>

      {functions.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-gray-500">{dict.employees.functionsColumn}</span>
          <div className="flex flex-wrap gap-3">
            {functions.map((f) => (
              <label key={f.id} className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="functionIds" value={f.id} />
                {f.name}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
        >
          {dict.employees.inviteButton}
        </button>
        {state.status === 'success' && <span className="text-sm text-green-700">{dict.employees.inviteSuccess}</span>}
        {state.status === 'error' && state.errorCode && (
          <span className="text-sm text-red-600">{dict.employees[state.errorCode]}</span>
        )}
      </div>
    </form>
  )
}
