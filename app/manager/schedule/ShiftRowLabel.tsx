'use client'

import { useState, useTransition } from 'react'
import { renameShiftGroup } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function ShiftRowLabel({
  shiftIds,
  shiftName,
  slotNumber,
  dict,
}: {
  shiftIds: string[]
  shiftName: string
  slotNumber: string
  dict: Dictionary
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(shiftName)
  const [isPending, startTransition] = useTransition()

  function save() {
    const trimmed = value.trim()
    setIsEditing(false)

    if (!trimmed || trimmed === shiftName) {
      setValue(shiftName)
      return
    }

    startTransition(async () => {
      const result = await renameShiftGroup(shiftIds, trimmed)
      if (result.status === 'error') {
        setValue(shiftName)
        window.alert(dict.functions.errorGeneric)
      }
    })
  }

  if (isEditing) {
    return (
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            save()
          }
          if (e.key === 'Escape') {
            setValue(shiftName)
            setIsEditing(false)
          }
        }}
        className="w-full rounded border border-gray-400 bg-white px-1 py-0.5 text-xs font-medium text-gray-700 focus:border-black focus:outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      disabled={isPending}
      title={dict.schedule.renameFunctionHint}
      className="-mx-1 w-full rounded px-1 text-left disabled:opacity-50 hover:bg-black/5"
    >
      {value} {slotNumber}
    </button>
  )
}
