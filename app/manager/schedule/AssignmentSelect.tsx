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

  const assignedName = employees.find((e) => e.id === value)?.full_name

  return (
    <>
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
        className={`w-full rounded-md border px-2 py-1.5 text-sm focus:border-black focus:outline-none disabled:opacity-50 print:hidden ${
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
      {/* Print-only stand-in for the dropdown above: the assigned name as
          plain text, or a blank line to write a name on by hand when the
          slot is unfilled. */}
      <span className="hidden print:inline-block print:w-full print:border-b print:border-gray-400 print:pb-0.5 print:text-[10px] print:text-gray-900">
        {assignedName ?? ' '}
      </span>
    </>
  )
}
