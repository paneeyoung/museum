'use client'

import { useState, useTransition } from 'react'
import { updateFunctionName } from '@/app/manager/functions/actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function FunctionNameEditor({
  functionId,
  name,
  dict,
}: {
  functionId: string
  name: string
  dict: Dictionary
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(name)
  const [isPending, startTransition] = useTransition()

  function save() {
    const trimmed = value.trim()
    setIsEditing(false)

    if (!trimmed || trimmed === name) {
      setValue(name)
      return
    }

    startTransition(async () => {
      const result = await updateFunctionName(functionId, trimmed)
      if (result.status === 'error') {
        setValue(name)
        window.alert(dict.functions[result.errorCode])
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
            setValue(name)
            setIsEditing(false)
          }
        }}
        className="w-full rounded border border-gray-400 bg-white px-1.5 py-0.5 text-sm font-semibold text-gray-900 focus:border-black focus:outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      disabled={isPending}
      title={dict.schedule.renameFunctionHint}
      className="-mx-1 rounded px-1 text-left text-sm font-semibold text-gray-900 hover:bg-gray-200 disabled:opacity-50"
    >
      {value}
    </button>
  )
}
