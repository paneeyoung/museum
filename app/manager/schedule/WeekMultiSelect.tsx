'use client'

import { useEffect, useRef, useState } from 'react'
import type { Dictionary } from '@/lib/i18n/dictionaries'

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-gray-400">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function WeekMultiSelect({
  name,
  options,
  dict,
}: {
  name: string
  options: { value: string; label: string }[]
  dict: Dictionary
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
  }

  const summary =
    selected.size === 0
      ? dict.shifts.selectWeeksPlaceholder
      : (selected.size === 1 ? dict.shifts.weekSelectedSingular : dict.shifts.weekSelectedPlural).replace(
          '{count}',
          String(selected.size)
        )

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:w-64">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        <span>{summary}</span>
        <ChevronIcon />
      </button>

      {/* Stays mounted (just visually hidden) so its checkboxes are still
          part of the form's FormData after the popover closes — an
          isOpen && (...) here would unmount them and silently drop the
          selection on submit even though the summary above still shows it. */}
      <div
        hidden={!isOpen}
        className="absolute left-0 top-full z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-gray-200 bg-white p-2 shadow-lg"
      >
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 py-1 text-sm text-gray-700">
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={selected.has(option.value)}
              onChange={() => toggle(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  )
}
