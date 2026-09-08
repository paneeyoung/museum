'use client'

import { useTransition } from 'react'
import { setLocale } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/locales'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function LanguageSwitcher({
  locale,
  label,
}: {
  locale: Locale
  label: Dictionary['languageSwitcher']['label']
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <label className="flex items-center gap-2 text-sm text-gray-500">
      <span className="sr-only">{label}</span>
      <select
        value={locale}
        disabled={isPending}
        onChange={(e) => startTransition(() => setLocale(e.target.value))}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none disabled:opacity-50"
      >
        <option value="en">EN</option>
        <option value="nl">NL</option>
      </select>
    </label>
  )
}
