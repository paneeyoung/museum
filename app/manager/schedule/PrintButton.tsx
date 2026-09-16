'use client'

import type { Dictionary } from '@/lib/i18n/dictionaries'

function PrinterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" />
    </svg>
  )
}

export default function PrintButton({ dict }: { dict: Dictionary }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label={dict.schedule.printButton}
      className="flex items-center justify-center gap-2 rounded-md border border-gray-300 p-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:px-4 md:py-2"
    >
      <PrinterIcon />
      <span className="hidden md:inline">{dict.schedule.printButton}</span>
    </button>
  )
}
