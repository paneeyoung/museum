import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import ManagerTopbar from '@/app/components/ManagerTopbar'
import { ToastProvider } from '@/app/components/Toast'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect('/login')
  if (employee.role !== 'manager') redirect('/employee/availability')

  const locale = await getLocale()
  const dict = getDictionary(locale)

  return (
    <ToastProvider>
      <div>
        <ManagerTopbar dict={dict} locale={locale} />
        {children}
      </div>
    </ToastProvider>
  )
}
