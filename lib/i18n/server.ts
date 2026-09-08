import 'server-only'
import { cookies } from 'next/headers'
import { getCurrentEmployee } from '@/lib/dal'
import { DEFAULT_LOCALE, isLocale, type Locale } from './locales'

export const LOCALE_COOKIE = 'locale'

export async function getLocaleFromCookie(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get(LOCALE_COOKIE)?.value
  return isLocale(value) ? value : DEFAULT_LOCALE
}

export async function getLocale(): Promise<Locale> {
  const cookieLocale = await getLocaleFromCookie()
  const employee = await getCurrentEmployee()
  return isLocale(employee?.locale) ? employee.locale : cookieLocale
}
