import type { Locale } from './i18n/locales'

// day_of_week: 0 = Sunday ... 6 = Saturday (matches supabase/migrations schema,
// JS Date.getDay() convention) — this stays as-is even though the week now
// starts on Monday (see startOfWeek below). A day_of_week value is NOT the
// same thing as "days after week_start_date" — convert via WEEK_DISPLAY_ORDER's
// index (see its comment) before doing addDays(weekStart, ...) arithmetic.
export const WEEK_DISPLAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

const LOCALE_TAGS: Record<Locale, string> = {
  en: 'en-GB',
  nl: 'nl-NL',
}

export function startOfWeek(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Rewind to the most recent Monday. getDay() is 0=Sun..6=Sat; (day+6)%7
  // maps that to "days since Monday" (Mon=0, Tue=1, ..., Sun=6).
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

export function addWeeks(date: Date, weeks: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + weeks * 7)
  return d
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function nextWeekStart(): Date {
  return addWeeks(startOfWeek(new Date()), 1)
}

export function formatDayLabel(date: Date, locale: Locale): string {
  return date.toLocaleDateString(LOCALE_TAGS[locale], { day: 'numeric', month: 'short' })
}

export function formatWeekRangeLabel(weekStart: Date, locale: Locale): string {
  const weekEnd = addDays(weekStart, 6)
  const tag = LOCALE_TAGS[locale]
  const start = weekStart.toLocaleDateString(tag, { day: 'numeric', month: 'short' })
  const end = weekEnd.toLocaleDateString(tag, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${start} - ${end}`
}

export function formatMonthYearLabel(date: Date, locale: Locale): string {
  return date.toLocaleDateString(LOCALE_TAGS[locale], { month: 'long', year: 'numeric' })
}

export const MAX_REPEAT_WEEKS = 52

// A week picker's <option> list is normally a fixed forward-looking window
// starting at nextWeekStart(). But Prev/Next nav can step outside that
// window (far enough back via "previous", or far enough forward past the
// last listed week) — a controlled <select> whose value has no matching
// <option> silently falls back to showing the first option instead, so the
// dropdown label goes out of sync with the (correctly fetched) page below
// it. Always make sure the week actually being viewed has an entry.
export function buildWeekOptions(
  currentWeekStart: Date,
  count: number,
  locale: Locale
): { value: string; label: string }[] {
  const options = Array.from({ length: count }, (_, i) => {
    const start = addWeeks(nextWeekStart(), i)
    return { value: toISODate(start), label: formatWeekRangeLabel(start, locale) }
  })

  const currentWeekStartDate = toISODate(currentWeekStart)
  if (!options.some((option) => option.value === currentWeekStartDate)) {
    options.unshift({ value: currentWeekStartDate, label: formatWeekRangeLabel(currentWeekStart, locale) })
  }

  return options
}
