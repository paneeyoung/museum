import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import EmployeeTopbar from '@/app/components/EmployeeTopbar'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const employee = await getCurrentEmployee()
  if (!employee) redirect('/login')

  const locale = await getLocale()
  const dict = getDictionary(locale)

  return (
    <div>
      <EmployeeTopbar dict={dict} locale={locale} isManager={employee.role === 'manager'} />
      {children}
    </div>
  )
}
