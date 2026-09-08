'use client'

import { useState, useTransition } from 'react'
import { updateFunctionName } from './actions'
import type { Dictionary } from '@/lib/i18n/dictionaries'

function PencilIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path d="M13.586 3.586a2 2 0 1 1 2.828 2.828l-8.5 8.5a2 2 0 0 1-.878.506l-3 .75a.5.5 0 0 1-.606-.606l.75-3a2 2 0 0 1 .506-.878l8.5-8.5Z" />
    </svg>
  )
}

export default function FunctionNameField({
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
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none"
      />
    )
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-sm text-gray-900">{value}</span>
      <button
        type="button"
        onClick={() => setIsEditing(true)}
        disabled={isPending}
        title={dict.schedule.renameFunctionHint}
        aria-label={dict.schedule.renameFunctionHint}
        className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
      >
        <PencilIcon />
      </button>
    </span>
  )
}
