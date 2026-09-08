'use client'

import { useTransition } from 'react'
import { setLocale } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/locales'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'nl', label: 'NL' },
  { value: 'en', label: 'EN' },
]

export default function LanguageToggle({
  locale,
  label,
}: {
  locale: Locale
  label: Dictionary['languageSwitcher']['label']
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div aria-label={label} className="flex items-center gap-1 text-sm">
      {LOCALES.map((l, i) => (
        <span key={l.value} className="flex items-center gap-1">
          {i > 0 && <span className="text-gray-300">/</span>}
          <button
            type="button"
            disabled={isPending || l.value === locale}
            onClick={() => startTransition(() => setLocale(l.value))}
            className={
              l.value === locale
                ? 'font-semibold text-gray-900'
                : 'text-gray-400 hover:text-gray-600 disabled:opacity-50'
            }
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  )
}
