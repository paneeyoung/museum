'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteEmployee } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function DeleteEmployeeButton({
  employeeId,
  employeeName,
  dict,
}: {
  employeeId: string
  employeeName: string
  dict: Dictionary
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(dict.employees.deleteConfirm.replace('{name}', employeeName))) return
        startTransition(async () => {
          const result = await deleteEmployee(employeeId)
          if (result.status === 'success') {
            router.push('/manager/employees')
          } else {
            window.alert(dict.employees[result.errorCode])
          }
        })
      }}
      className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
    >
      {dict.employees.deleteButton}
    </button>
  )
}
