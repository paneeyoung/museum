import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCurrentEmployee } from '@/lib/dal'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import EmployeeFunctionsForm from './EmployeeFunctionsForm'
import EditNameForm from './EditNameForm'
import DeleteEmployeeButton from './DeleteEmployeeButton'

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Manager-role guard already happens in app/manager/layout.tsx; this fetch
  // is still needed below for the "can't delete your own account" check.
  const currentEmployee = await getCurrentEmployee()
  if (!currentEmployee) redirect('/login')

  const { id } = await params
  const locale = await getLocale()
  const dict = getDictionary(locale)

  const supabase = await createClient()
  const [{ data: targetEmployee }, { data: functions }, { data: assigned }] = await Promise.all([
    supabase.from('employees').select('id, full_name, email, role').eq('id', id).maybeSingle(),
    supabase.from('functions').select('id, name').order('name'),
    supabase.from('employee_functions').select('function_id').eq('employee_id', id),
  ])

  if (!targetEmployee) redirect('/manager/employees')

  const assignedFunctionIds = (assigned ?? []).map((row) => row.function_id)

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/manager/employees" className="text-sm text-gray-500 hover:underline">
        {dict.employees.backToList}
      </Link>
      <h1 className="mt-1 text-xl font-semibold text-gray-900">{targetEmployee.full_name}</h1>
      <p className="mt-1 text-sm text-gray-500">{targetEmployee.email}</p>
      <p className="text-sm text-gray-500">
        {targetEmployee.role === 'manager' ? dict.employees.roleManager : dict.employees.roleEmployee}
      </p>

      <div className="mt-6">
        <EditNameForm employeeId={targetEmployee.id} fullName={targetEmployee.full_name} dict={dict} />
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-medium text-gray-700">{dict.employees.functionsColumn}</h2>
        <div className="mt-2">
          <EmployeeFunctionsForm
            employeeId={targetEmployee.id}
            functions={functions ?? []}
            assignedFunctionIds={assignedFunctionIds}
            dict={dict}
          />
        </div>
      </div>

      {targetEmployee.id !== currentEmployee.id && (
        <div className="mt-10 border-t border-gray-200 pt-6">
          <DeleteEmployeeButton
            employeeId={targetEmployee.id}
            employeeName={targetEmployee.full_name}
            dict={dict}
          />
        </div>
      )}
    </main>
  )
}
