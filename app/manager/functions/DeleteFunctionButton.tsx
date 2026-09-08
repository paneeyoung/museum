'use client'

import { deleteFunction } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function DeleteFunctionButton({
  functionId,
  functionName,
  assignedCount,
  dict,
}: {
  functionId: string
  functionName: string
  assignedCount: number
  dict: Dictionary
}) {
  return (
    <form
      action={deleteFunction.bind(null, functionId)}
      onSubmit={(e) => {
        const message =
          assignedCount > 0
            ? dict.functions.deleteConfirmWithAssignments
                .replace('{count}', String(assignedCount))
                .replace('{name}', functionName)
            : dict.functions.deleteConfirm.replace('{name}', functionName)
        if (!window.confirm(message)) {
          e.preventDefault()
        }
      }}
    >
      <button type="submit" className="text-sm text-red-600 hover:underline">
        {dict.common.delete}
      </button>
    </form>
  )
}
