'use client'

import { useState, useTransition } from 'react'
import { updateRosterShiftAssignment } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function AssignmentSelect({
  rosterShiftId,
  employeeId,
  employees,
  dict,
  disabled,
}: {
  rosterShiftId: string
  employeeId: string | null
  employees: { id: string; full_name: string }[]
  dict: Dictionary
  disabled?: boolean
}) {
  const [value, setValue] = useState(employeeId ?? '')
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={value}
      disabled={disabled || isPending}
      onChange={(e) => {
        const next = e.target.value
        setValue(next)
        startTransition(() => {
          updateRosterShiftAssignment(rosterShiftId, next || null)
        })
      }}
      className={`w-full rounded-md border px-2 py-1.5 text-sm focus:border-black focus:outline-none disabled:opacity-50 ${
        value ? 'border-gray-300' : 'border-amber-300 bg-amber-50'
      }`}
    >
      <option value="">{dict.schedule.unassignedOption}</option>
      {employees.map((e) => (
        <option key={e.id} value={e.id}>
          {e.full_name}
        </option>
      ))}
    </select>
  )
}
