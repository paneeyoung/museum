import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import SetPasswordForm from './SetPasswordForm'

export default async function SetPasswordPage() {
  const locale = await getLocale()
  const dict = getDictionary(locale)

  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <SetPasswordForm dict={dict.account} />
    </main>
  )
}
