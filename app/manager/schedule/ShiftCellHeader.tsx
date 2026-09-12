'use client'

import { useState, useTransition } from 'react'
import { deleteShift, restoreShift, updateShift } from './actions'
import TimeSelect from '@/app/components/TimeSelect'
import { useToast } from '@/app/components/Toast'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function ShiftCellHeader({
  shiftId,
  shiftName,
  startTime,
  endTime,
  capacity,
  dayLabel,
  dict,
}: {
  shiftId: string
  shiftName: string
  startTime: string
  endTime: string
  capacity: number
  // The edit form opens as an overlay detached from its cell, so it has to
  // say which day it belongs to on its own.
  dayLabel: string
  dict: Dictionary
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(shiftName)
  const [start, setStart] = useState(startTime.slice(0, 5))
  const [end, setEnd] = useState(endTime.slice(0, 5))
  const [cap, setCap] = useState(String(capacity))
  const [isPending, startTransition] = useTransition()
  const { showToast } = useToast()

  function handleDelete() {
    startTransition(async () => {
      const snapshot = await deleteShift(shiftId)
      if (!snapshot) {
        window.alert(dict.shifts.errorGeneric)
        return
      }
      showToast(dict.schedule.shiftDeletedToast, {
        actionLabel: dict.schedule.undoButton,
        onAction: () => {
          startTransition(async () => {
            const result = await restoreShift(snapshot)
            if (result.status === 'error') {
              window.alert(dict.shifts.errorGeneric)
            }
          })
        },
      })
    })
  }

  function cancel() {
    setName(shiftName)
    setStart(startTime.slice(0, 5))
    setEnd(endTime.slice(0, 5))
    setCap(String(capacity))
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
    const capNumber = Number(cap)
    if (!Number.isInteger(capNumber) || capNumber < 1) {
      window.alert(dict.shifts.errorGeneric)
      return
    }

    setIsEditing(false)
    startTransition(async () => {
      // Scoped to this one shift_template row only — this modal edits a
      // single day's shift (it's titled with that day's name). Renaming the
      // *whole* recurring row across every day is a separate, explicit
      // action: the row label in the left column (see ShiftRowLabel /
      // renameShiftGroup). Don't conflate the two — this modal is also how
      // a manager turns one day into a one-off, differently-named shift
      // without dragging the other six days along.
      const result = await updateShift(shiftId, {
        shiftName: trimmedName,
        startTime: start,
        endTime: end,
        capacity: capNumber,
      })
      if (result.status === 'error') {
        window.alert(dict.shifts.errorGeneric)
      }
    })
  }

  return (
    <>
      <div className="mb-1.5 flex items-start justify-between gap-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          title={dict.schedule.editShiftHint}
          // min-w-0 + break-words: without these, a flex item's default
          // min-width is its longest unbreakable word — on Monday's narrow
          // 7% column (table-fixed, so it can't grow to fit), that pushed
          // this button's true width past the cell's actual width. The row
          // then overflowed *visually* into Tuesday's cell rather than
          // wrapping, and since Tuesday's <td> is later in the DOM (painted
          // on top), it hid the × button underneath itself entirely —
          // rendered, but neither visible nor clickable where you'd expect.
          className="-mx-0.5 min-w-0 flex-1 rounded px-0.5 text-left break-words hover:bg-black/5 disabled:opacity-50"
        >
          <span className="block text-[11px] font-medium text-gray-800">{name}</span>
          <span className="block text-[11px] text-gray-600">
            {start}–{end}
          </span>
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          title={dict.common.delete}
          aria-label={dict.common.delete}
          // shrink-0: always keep its own reserved space in the row instead
          // of being squeezed out by the name/time button above.
          className="shrink-0 leading-none text-gray-400 hover:text-red-600 disabled:opacity-50 print:hidden"
        >
          ×
        </button>
      </div>

      {/* Fixed overlay rather than something rendered inside the cell: the
          grid's day columns are narrow (Monday especially, at 7%), and the
          table scroll container clips absolutely-positioned children, so an
          in-cell popover would still be squeezed or cut off. Same pattern as
          AddShiftCell's add form. */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4"
          onClick={cancel}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm space-y-3 rounded-lg bg-white p-4 text-left shadow-lg"
          >
            <p className="text-sm font-medium text-gray-900">{dayLabel}</p>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.labelLabel}</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={dict.shifts.labelPlaceholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-gray-500">{dict.shifts.startLabel}</label>
                <TimeSelect value={start} onChange={setStart} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <label className="text-xs text-gray-500">{dict.shifts.endLabel}</label>
                <TimeSelect value={end} onChange={setEnd} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">{dict.shifts.capacityLabel}</label>
              <input
                type="number"
                min={1}
                value={cap}
                onChange={(e) => setCap(e.target.value)}
                className="w-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={save}
                disabled={isPending}
                className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {dict.availability.save}
              </button>
              <button
                type="button"
                onClick={cancel}
                className="text-sm text-gray-500 hover:underline"
              >
                {dict.availability.copyCancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
