'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageToggle from './LanguageToggle'
import TopbarWeekNav from './TopbarWeekNav'
import { TopbarStatusSlot } from './TopbarStatus'
import type { Dictionary } from '@/lib/i18n/dictionaries'
import type { Locale } from '@/lib/i18n/locales'

const linkClass = 'rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
const activeLinkClass = 'rounded-md bg-brand-light px-3 py-2 text-sm font-medium text-brand'
const mobileLinkClass = 'block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
const mobileActiveLinkClass = 'block rounded-md bg-brand-light px-3 py-2 text-sm font-medium text-brand'

const MANAGER_AVAILABILITY_PATH = '/manager/availability'
const MINE_AVAILABILITY_PATH = '/employee/availability'

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

// The "Beschikbaarheid" nav item covers two pages for a manager — the team
// overview grid and the manager's own availability form (the latter is just
// the regular /employee/availability page; no need for a manager-only copy
// of it) — so, same as ManageMenu, it's a dropdown rather than a plain link.
function AvailabilityMenu({ dict }: { dict: Dictionary }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isActive = pathname === MANAGER_AVAILABILITY_PATH || pathname === MINE_AVAILABILITY_PATH
  const ref = useOutsideClick(isOpen, () => setIsOpen(false))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={`flex items-center gap-1 ${isActive ? activeLinkClass : linkClass}`}
      >
        {dict.availability.navLabel}
        <ChevronIcon />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-md border border-gray-200 bg-white p-1 shadow-lg">
          <Link
            href={MANAGER_AVAILABILITY_PATH}
            onClick={() => setIsOpen(false)}
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {dict.manager.overviewTabLabel}
          </Link>
          <Link
            href={MINE_AVAILABILITY_PATH}
            onClick={() => setIsOpen(false)}
            className="block rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {dict.manager.myAvailabilityLink}
          </Link>
        </div>
      )}
    </div>
  )
}

// Everything that lives in the desktop nav/toolbar collapses into this single
// panel on narrow screens, opened from one hamburger button, instead of
// several separate controls competing for space.
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
        {isManager ? (
          <Link
            href="/manager/schedule"
            onClick={onClose}
            className={pathname.startsWith('/manager/schedule') ? mobileActiveLinkClass : mobileLinkClass}
          >
            {dict.manager.scheduleEditorTitle}
          </Link>
        ) : (
          <>
            <Link
              href="/employee/availability"
              onClick={onClose}
              className={pathname.startsWith('/employee/availability') ? mobileActiveLinkClass : mobileLinkClass}
            >
              {dict.availability.navLabel}
            </Link>
            <Link
              href="/employee/schedule"
              onClick={onClose}
              className={pathname.startsWith('/employee/schedule') ? mobileActiveLinkClass : mobileLinkClass}
            >
              {dict.availability.myScheduleLink}
            </Link>
          </>
        )}
      </nav>

      {isManager && (
        <div className="border-t border-gray-100 pt-2">
          <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
            {dict.availability.navLabel}
          </p>
          <Link
            href={MANAGER_AVAILABILITY_PATH}
            onClick={onClose}
            className={pathname === MANAGER_AVAILABILITY_PATH ? mobileActiveLinkClass : mobileLinkClass}
          >
            {dict.manager.overviewTabLabel}
          </Link>
          <Link
            href={MINE_AVAILABILITY_PATH}
            onClick={onClose}
            className={pathname === MINE_AVAILABILITY_PATH ? mobileActiveLinkClass : mobileLinkClass}
          >
            {dict.manager.myAvailabilityLink}
          </Link>
        </div>
      )}

      {isManager && (
        <div className="border-t border-gray-100 pt-2">
          <Link
            href="/employee/schedule"
            onClick={onClose}
            className={pathname.startsWith('/employee/schedule') ? mobileActiveLinkClass : mobileLinkClass}
          >
            {dict.availability.myScheduleLink}
          </Link>
        </div>
      )}

      {isManager && (
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
      )}

      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">{dict.languageSwitcher.label}</span>
        <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
      </div>
    </div>
  )
}

export default function Topbar({
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
  // open over a different page than the one it was opened from. Adjusting
  // state during render (rather than in an effect) avoids an extra
  // render-then-effect round trip for what's ultimately derived state.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setIsMobileMenuOpen(false)
  }

  const homeHref = isManager ? '/manager/schedule' : '/employee/availability'

  return (
    <header className="border-b border-gray-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2">
        {/* Logo + nav anchored together at the left, everything else pushed
            to the far right via ml-auto below — nav's position is then a
            fixed offset from the logo, not dependent on how wide the
            right-hand cluster happens to be on a given page. A plain
            justify-between across all these items (the previous approach)
            made the nav's horizontal position drift per-page: e.g.
            TopbarWeekNav renders null outright on non-week-aware pages, and
            TopbarStatusSlot's content is conditional too (the "Published"
            badge), so the nav visibly shifted depending on which of those
            happened to be present. */}
        <div className="flex items-center gap-6">
          <Link href={homeHref} className="flex shrink-0 items-center">
            <Image
              src="/logo/logo-full.png"
              alt="Logo"
              width={300}
              height={35}
              className="hidden h-6 w-auto md:block"
            />
            <Image
              src="/logo/logo-icon.png"
              alt="Logo"
              width={150}
              height={150}
              className="h-8 w-8 md:hidden"
            />
          </Link>

          <nav className="hidden flex-wrap items-center gap-1 md:flex">
            {isManager ? (
              <>
                <Link
                  href="/manager/schedule"
                  className={pathname.startsWith('/manager/schedule') ? activeLinkClass : linkClass}
                >
                  {dict.manager.scheduleEditorTitle}
                </Link>
                <AvailabilityMenu dict={dict} />
                <Link
                  href="/employee/schedule"
                  className={pathname.startsWith('/employee/schedule') ? activeLinkClass : linkClass}
                >
                  {dict.availability.myScheduleLink}
                </Link>
                <ManageMenu dict={dict} />
              </>
            ) : (
              <>
                <Link
                  href="/employee/availability"
                  className={pathname.startsWith('/employee/availability') ? activeLinkClass : linkClass}
                >
                  {dict.availability.navLabel}
                </Link>
                <Link
                  href="/employee/schedule"
                  className={pathname.startsWith('/employee/schedule') ? activeLinkClass : linkClass}
                >
                  {dict.availability.myScheduleLink}
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
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
            <TopbarStatusSlot />
            <div className="hidden items-center gap-1 md:flex">
              <LanguageToggle locale={locale} label={dict.languageSwitcher.label} />
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <MobileMenuPanel dict={dict} locale={locale} isManager={isManager} onClose={() => setIsMobileMenuOpen(false)} />
      )}
    </header>
  )
}
