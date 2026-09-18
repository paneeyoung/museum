'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { setLocale } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/locales'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'nl', label: 'Nederlands' },
  { value: 'en', label: 'English' },
]

function GlobeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
      <circle cx="10" cy="10" r="7.25" />
      <ellipse cx="10" cy="10" rx="3.25" ry="7.25" />
      <path d="M2.75 10h14.5M3.7 6.25h12.6M3.7 13.75h12.6" />
    </svg>
  )
}

// Icon-only trigger, per the same reasoning as the hours-type dropdown on the
// availability form: the current language is already visible as the page's
// own text, so there's nothing worth spelling out in the topbar itself.
export default function LanguageToggle({
  locale,
  label,
}: {
  locale: Locale
  label: Dictionary['languageSwitcher']['label']
}) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  function select(value: Locale) {
    setIsOpen(false)
    if (value !== locale) startTransition(() => setLocale(value))
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        disabled={isPending}
        aria-expanded={isOpen}
        aria-label={label}
        title={label}
        className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
      >
        <GlobeIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-36 rounded-md border border-gray-200 bg-white p-1 text-sm shadow-lg">
          {LOCALES.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => select(l.value)}
              className={`block w-full rounded px-3 py-2 text-left hover:bg-gray-50 ${
                l.value === locale ? 'font-medium text-gray-900' : 'text-gray-700'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
