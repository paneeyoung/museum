export const LOCALES = ['en', 'nl'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale)
}
