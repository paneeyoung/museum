import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import Topbar from '@/app/components/Topbar'
import { ToastProvider } from '@/app/components/Toast'
import { TopbarStatusProvider } from '@/app/components/TopbarStatus'

export default async function ManagerLayout({ children }: { children: React.ReactNode }) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect('/login')
  if (employee.role !== 'manager') redirect('/employee/availability')

  const locale = await getLocale()
  const dict = getDictionary(locale)

  return (
    <ToastProvider>
      <TopbarStatusProvider>
        <div>
          <Topbar dict={dict} locale={locale} isManager />
          {children}
        </div>
      </TopbarStatusProvider>
    </ToastProvider>
  )
}
