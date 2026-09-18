import Image from 'next/image'
import { getLocaleFromCookie } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import LanguageSwitcher from '@/app/components/LanguageSwitcher'
import LoginForm from './LoginForm'

export default async function LoginPage() {
  const locale = await getLocaleFromCookie()
  const dict = getDictionary(locale)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full max-w-sm justify-end">
        <LanguageSwitcher locale={locale} label={dict.languageSwitcher.label} />
      </div>
      <Image src="/logo/logo-full.png" alt="Logo" width={300} height={35} className="h-8 w-auto" preload />
      <LoginForm dict={dict.login} />
    </main>
  )
}
