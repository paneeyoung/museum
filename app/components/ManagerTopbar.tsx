'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageToggle from './LanguageToggle'
import TopbarWeekNav from './TopbarWeekNav'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'

const linkClass = 'rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
const activeLinkClass = 'rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white'

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

function useOutsideClick(isOpen: boolean, onOutsideClick: () => void) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutsideClick()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  return ref
}

function ManageMenu({ dict }: { dict: Dictionary }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = pathname.startsWith('/manager/functions') || pathname.startsWith('/manager/employees')
  const ref = useOutsideClick(isOpen, () => setIsOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1 ${isActive ? activeLinkClass : linkClass}`}
      >
        {dict.manager.manageMenuLabel}
        <ChevronIcon />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
          <Link
            href="/manager/functions"
            onClick={() => setIsOpen(false)}
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {dict.functions.title}
          </Link>
          <Link
            href="/manager/employees"
            onClick={() => setIsOpen(false)}
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {dict.employees.title}
          </Link>
        </div>
      )}
    </div>
  )
}

function UserMenu({ dict }: { dict: Dictionary }) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useOutsideClick(isOpen, () => setIsOpen(false))

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setIsOpen((v) => !v)} className={`flex items-center gap-1 ${linkClass}`}>
        {dict.manager.userMenuLabel}
        <ChevronIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-md border border-gray-200 bg-white p-2 shadow-lg">
          <Link
            href="/employee/availability"
            onClick={() => setIsOpen(false)}
            className="block rounded px-2 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {dict.manager.myAvailabilityLink}
          </Link>
        </div>
      )}
    </div>
  )
}

export default function ManagerTopbar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const pathname = usePathname()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/manager/schedule" className={pathname.startsWith('/manager/schedule') ? activeLinkClass : linkClass}>
            {dict.manager.scheduleEditorTitle}
          </Link>
          <Link href="/manager" className={pathname === '/manager' ? activeLinkClass : linkClass}>
            {dict.manager.availabilityOverviewTitle}
          </Link>
          <ManageMenu dict={dict} />
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <TopbarWeekNav dict={dict} locale={locale} />
          </Suspense>
          <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
          <UserMenu dict={dict} />
        </div>
      </div>
    </header>
  )
}
