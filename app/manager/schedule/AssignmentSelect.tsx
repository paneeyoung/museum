'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { updateRosterShiftAssignment } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import { AVAILABILITY_STATUS_DOT_CLASS, type AvailabilityStatus } from '@/lib/availabilityStatus'

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-gray-400">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export type AssignmentOption = {
  id: string
  full_name: string
  functionLabel: string | null
  status: AvailabilityStatus
}

export default function AssignmentSelect({
  rosterShiftId,
  employeeId,
  employees,
  dict,
  disabled,
}: {
  rosterShiftId: string
  employeeId: string | null
  employees: AssignmentOption[]
  dict: Dictionary
  disabled?: boolean
}) {
  const [value, setValue] = useState(employeeId ?? '')
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  const selected = employees.find((e) => e.id === value)

  function select(next: string) {
    setValue(next)
    setIsOpen(false)
    startTransition(() => {
      updateRosterShiftAssignment(rosterShiftId, next || null)
    })
  }

  return (
    <>
      <div ref={ref} className="relative print:hidden">
        <button
          type="button"
          disabled={disabled || isPending}
          onClick={() => setIsOpen((v) => !v)}
          aria-expanded={isOpen}
          className={`flex w-full items-center justify-between gap-1 rounded-md border px-2 py-1.5 text-left text-sm disabled:opacity-50 ${
            value ? 'border-gray-300' : 'border-amber-300 bg-amber-50'
          }`}
        >
          <span className="truncate">{selected ? selected.full_name : dict.schedule.unassignedOption}</span>
          <ChevronDownIcon />
        </button>

        {isOpen && (
          <div className="absolute left-0 top-full z-20 mt-1 max-h-60 w-56 overflow-y-auto rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg">
            <button
              type="button"
              onClick={() => select('')}
              className={`block w-full rounded px-2 py-1.5 text-left hover:bg-gray-50 ${
                value === '' ? 'font-medium text-gray-900' : 'text-gray-600'
              }`}
            >
              {dict.schedule.unassignedOption}
            </button>
            {employees.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => select(e.id)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-gray-50 ${
                  value === e.id ? 'font-medium text-gray-900' : 'text-gray-700'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 shrink-0 rounded-full ${AVAILABILITY_STATUS_DOT_CLASS[e.status]}`}
                />
                <span className="truncate">
                  {e.full_name}
                  {e.functionLabel && <span className="text-gray-400"> ({e.functionLabel})</span>}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Print-only stand-in for the dropdown above: the assigned name as
          plain text, or a blank line to write a name on by hand when the
          slot is unfilled. */}
      <span className="hidden print:inline-block print:w-full print:border-b print:border-gray-400 print:pb-0.5 print:text-[10px] print:text-gray-900">
        {selected?.full_name ?? ' '}
      </span>
    </>
  )
}
