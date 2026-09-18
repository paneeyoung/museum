'use client'

import { useTransition } from 'react'
import { publishRoster, unpublishRoster } from './actions'
import Tooltip from '@/app/components/Tooltip'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function PublishControls({
  rosterId,
  isPublished,
  dict,
}: {
  rosterId: string
  isPublished: boolean
  dict: Dictionary
}) {
  const [isPending, startTransition] = useTransition()

  if (isPublished) {
    return (
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          {dict.schedule.publishedBadge}
        </span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (!window.confirm(dict.schedule.unpublishConfirm)) return
            startTransition(() => {
              unpublishRoster(rosterId)
            })
          }}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {dict.schedule.unpublishButton}
        </button>
      </div>
    )
  }

  return (
    <Tooltip text={dict.schedule.publishTooltip}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm(dict.schedule.publishConfirm)) return
          startTransition(() => {
            publishRoster(rosterId)
          })
        }}
        className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50"
      >
        {dict.schedule.publishButton}
      </button>
    </Tooltip>
  )
}
