'use client'

import { useActionState } from 'react'
import { saveEmployeeFunctions, type SaveEmployeeFunctionsState } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const initialState: SaveEmployeeFunctionsState = { status: 'idle' }

export default function EmployeeFunctionsForm({
  employeeId,
  functions,
  assignedFunctionIds,
  dict,
}: {
  employeeId: string
  functions: { id: string; name: string }[]
  assignedFunctionIds: string[]
  dict: Dictionary
}) {
  const boundAction = saveEmployeeFunctions.bind(null, employeeId)
  const [state, formAction, pending] = useActionState(boundAction, initialState)
  const assignedSet = new Set(assignedFunctionIds)

  return (
    <form action={formAction} className="space-y-4">
      {functions.length === 0 ? (
        <p className="text-sm text-gray-500">{dict.employees.noFunctionsDefined}</p>
      ) : (
        <div className="space-y-2">
          {functions.map((f) => (
            <label key={f.id} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="functionIds" value={f.id} defaultChecked={assignedSet.has(f.id)} />
              {f.name}
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || functions.length === 0}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {dict.availability.save}
        </button>
        {state.status === 'success' && (
          <span className="text-sm text-green-700">{dict.availability.saveSuccess}</span>
        )}
      </div>
    </form>
  )
}
