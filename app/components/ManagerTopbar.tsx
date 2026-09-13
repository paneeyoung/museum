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
const mobileLinkClass = 'block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
const mobileActiveLinkClass = 'block rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white'

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

function HamburgerIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
      <path
        fillRule="evenodd"
        d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 1 0 1.06 1.06L10 11.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L11.06 10l4.72-4.72a.75.75 0 0 0-1.06-1.06L10 8.94 5.28 4.22Z"
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

// Everything that lives in the desktop nav/toolbar — the two page links, the
// "Beheer" (manage) submenu, the "Menu" submenu, and the language toggle —
// collapses into this single panel on narrow screens, opened from one
// hamburger button, instead of five separate controls competing for space.
function MobileMenuPanel({ dict, locale, onClose }: { dict: Dictionary; locale: Locale; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <div className="space-y-3 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
      <nav className="flex flex-col gap-1">
        <Link
          href="/manager/schedule"
          onClick={onClose}
          className={pathname.startsWith('/manager/schedule') ? mobileActiveLinkClass : mobileLinkClass}
        >
          {dict.manager.scheduleEditorTitle}
        </Link>
        <Link
          href="/manager"
          onClick={onClose}
          className={pathname === '/manager' ? mobileActiveLinkClass : mobileLinkClass}
        >
          {dict.manager.availabilityOverviewTitle}
        </Link>
      </nav>

      <div className="border-t border-gray-100 pt-2">
        <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          {dict.manager.manageMenuLabel}
        </p>
        <Link href="/manager/functions" onClick={onClose} className={mobileLinkClass}>
          {dict.functions.title}
        </Link>
        <Link href="/manager/employees" onClick={onClose} className={mobileLinkClass}>
          {dict.employees.title}
        </Link>
      </div>

      <div className="border-t border-gray-100 pt-2">
        <Link href="/employee/availability" onClick={onClose} className={mobileLinkClass}>
          {dict.manager.myAvailabilityLink}
        </Link>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">{dict.languageSwitcher.label}</span>
        <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
      </div>
    </div>
  )
}

export default function ManagerTopbar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close the mobile panel automatically if the page it was opened on
  // changes (e.g. the browser back/forward buttons), so it never lingers
  // open over a different page than the one it was opened from. Adjusting
  // state during render (rather than in an effect) avoids an extra
  // render-then-effect round trip for what's ultimately derived state.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-gray-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <nav className="hidden flex-wrap items-center gap-1 md:flex">
          <Link href="/manager/schedule" className={pathname.startsWith('/manager/schedule') ? activeLinkClass : linkClass}>
            {dict.manager.scheduleEditorTitle}
          </Link>
          <Link href="/manager" className={pathname === '/manager' ? activeLinkClass : linkClass}>
            {dict.manager.availabilityOverviewTitle}
          </Link>
          <ManageMenu dict={dict} />
        </nav>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          aria-expanded={isMobileMenuOpen}
          aria-label={dict.manager.userMenuLabel}
          className="flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <Suspense fallback={null}>
            <TopbarWeekNav dict={dict} locale={locale} />
          </Suspense>
          <div className="hidden items-center gap-3 md:flex">
            <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
            <UserMenu dict={dict} />
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenuPanel dict={dict} locale={locale} onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </header>
  )
}
