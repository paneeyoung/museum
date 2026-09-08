'use client'

import { useState, useTransition } from 'react'
import { deleteShift, updateShift } from './actions'
import TimeSelect from '@/app/components/TimeSelect'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function ShiftCellHeader({
  shiftId,
  shiftName,
  startTime,
  endTime,
  dict,
}: {
  shiftId: string
  shiftName: string
  startTime: string
  endTime: string
  dict: Dictionary
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(shiftName)
  const [start, setStart] = useState(startTime.slice(0, 5))
  const [end, setEnd] = useState(endTime.slice(0, 5))
  const [isPending, startTransition] = useTransition()

  function cancel() {
    setName(shiftName)
    setStart(startTime.slice(0, 5))
    setEnd(endTime.slice(0, 5))
    setIsEditing(false)
  }

  function save() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      cancel()
      return
    }
    if (start >= end) {
      window.alert(dict.shifts.errorStartBeforeEnd)
      return
    }

    setIsEditing(false)
    startTransition(async () => {
      const result = await updateShift(shiftId, { shiftName: trimmedName, startTime: start, endTime: end })
      if (result.status === 'error') {
        window.alert(dict.shifts.errorGeneric)
      }
    })
  }

  if (isEditing) {
    return (
      <div className="mb-1.5 flex flex-col gap-1 rounded border border-gray-400 bg-white p-1.5">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={dict.shifts.labelPlaceholder}
          className="rounded border border-gray-300 px-1 py-0.5 text-[11px] focus:border-black focus:outline-none"
        />
        <div className="flex items-center gap-1">
          <TimeSelect
            value={start}
            onChange={setStart}
            className="w-full rounded border border-gray-300 px-1 py-0.5 text-[11px] focus:border-black focus:outline-none"
          />
          <span className="text-[10px] text-gray-500">{dict.common.to}</span>
          <TimeSelect
            value={end}
            onChange={setEnd}
            className="w-full rounded border border-gray-300 px-1 py-0.5 text-[11px] focus:border-black focus:outline-none"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={cancel} className="text-[11px] text-gray-500 hover:underline">
            {dict.availability.copyCancel}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="text-[11px] font-medium text-black hover:underline disabled:opacity-50"
          >
            {dict.availability.save}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-1.5 flex items-start justify-between gap-1">
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        title={dict.schedule.editShiftHint}
        className="-mx-0.5 rounded px-0.5 text-left hover:bg-black/5 disabled:opacity-50"
      >
        <span className="block text-[11px] font-medium text-gray-800">{name}</span>
        <span className="block text-[11px] text-gray-600">
          {start}–{end}
        </span>
      </button>
      <form action={deleteShift.bind(null, shiftId)}>
        <button
          type="submit"
          title={dict.common.delete}
          aria-label={dict.common.delete}
          className="leading-none text-gray-400 hover:text-red-600"
        >
          ×
        </button>
      </form>
    </div>
  )
}
