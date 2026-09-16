'use client'

import { Suspense, useState } from 'react'
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

// Mirrors ManagerTopbar's mobile-panel pattern: the two employee pages plus
// (for a manager viewing their own availability) a way back to the manager
// view all collapse into one hamburger-opened panel on narrow screens,
// instead of having no persistent navigation at all below md.
function MobileMenuPanel({
  dict,
  locale,
  isManager,
  onClose,
}: {
  dict: Dictionary
  locale: Locale
  isManager: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="space-y-3 border-t border-gray-200 bg-white px-4 py-3 md:hidden">
      <nav className="flex flex-col gap-1">
        <Link
          href="/employee/availability"
          onClick={onClose}
          className={pathname.startsWith('/employee/availability') ? mobileActiveLinkClass : mobileLinkClass}
        >
          {dict.availability.title}
        </Link>
        <Link
          href="/employee/schedule"
          onClick={onClose}
          className={pathname.startsWith('/employee/schedule') ? mobileActiveLinkClass : mobileLinkClass}
        >
          {dict.availability.myScheduleLink}
        </Link>
      </nav>

      {isManager && (
        <div className="border-t border-gray-100 pt-2">
          <Link href="/manager" onClick={onClose} className={mobileLinkClass}>
            {dict.manager.backToManagerButton}
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">{dict.languageSwitcher.label}</span>
        <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
      </div>
    </div>
  )
}

export default function EmployeeTopbar({
  dict,
  locale,
  isManager,
}: {
  dict: Dictionary
  locale: Locale
  isManager: boolean
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close the mobile panel automatically if the page it was opened on
  // changes (e.g. the browser back/forward buttons), so it never lingers
  // open over a different page than the one it was opened from.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-gray-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <nav className="hidden flex-wrap items-center gap-1 md:flex">
          <Link
            href="/employee/availability"
            className={pathname.startsWith('/employee/availability') ? activeLinkClass : linkClass}
          >
            {dict.availability.title}
          </Link>
          <Link
            href="/employee/schedule"
            className={pathname.startsWith('/employee/schedule') ? activeLinkClass : linkClass}
          >
            {dict.availability.myScheduleLink}
          </Link>
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
          {isManager && (
            <Link
              href="/manager"
              className="hidden rounded-md border border-black px-3 py-2 text-sm font-medium text-black hover:bg-gray-50 md:inline-block"
            >
              {dict.manager.backToManagerButton}
            </Link>
          )}
          <div className="hidden md:flex">
            <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenuPanel dict={dict} locale={locale} isManager={isManager} onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </header>
  )
}
