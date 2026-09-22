import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import Topbar from '@/app/components/Topbar'

// Same "any logged-in user, including managers" access as app/employee/*
// (see that layout) — setting a password isn't role-specific.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect('/login')

  const locale = await getLocale()
  const dict = getDictionary(locale)

  return (
    <div>
      <Topbar dict={dict} locale={locale} isManager={employee.role === 'manager'} />
      {children}
    </div>
  )
}
