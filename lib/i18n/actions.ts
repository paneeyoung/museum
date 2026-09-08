'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isLocale } from './locales'
import { LOCALE_COOKIE } from './server'

export async function setLocale(locale: string) {
  if (!isLocale(locale)) return

  const cookieStore = await cookies()
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { error } = await supabase.from('employees').update({ locale }).eq('id', user.id)
    if (error) {
      console.error('Failed to save locale preference:', error.message)
    }
  }

  revalidatePath('/', 'layout')
}
