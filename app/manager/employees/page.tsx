import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import InviteEmployeeForm from './InviteEmployeeForm'

export default async function EmployeesPage() {
  const locale = await getLocale()
  const dict = getDictionary(locale)

  const supabase = await createClient()
  const [{ data: employees }, { data: functions }, { data: employeeFunctions }] = await Promise.all([
    supabase.from('employees').select('id, full_name, email, role').order('full_name'),
    supabase.from('functions').select('id, name'),
    supabase.from('employee_functions').select('employee_id, function_id'),
  ])

  const functionNameById = new Map((functions ?? []).map((f) => [f.id, f.name]))
  const functionNamesByEmployee = new Map<string, string[]>()
  for (const row of employeeFunctions ?? []) {
    const name = functionNameById.get(row.function_id)
    if (!name) continue
    const list = functionNamesByEmployee.get(row.employee_id) ?? []
    list.push(name)
    functionNamesByEmployee.set(row.employee_id, list)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">{dict.employees.title}</h1>

      <div className="mt-6">
        <InviteEmployeeForm functions={functions ?? []} dict={dict} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500">{dict.employees.nameColumn}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">{dict.employees.emailColumn}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">{dict.employees.roleColumn}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">{dict.employees.functionsColumn}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(employees ?? []).map((emp) => {
              const fnNames = functionNamesByEmployee.get(emp.id) ?? []
              return (
                <tr key={emp.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/manager/employees/${emp.id}`}
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {emp.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{emp.email}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {emp.role === 'manager' ? dict.employees.roleManager : dict.employees.roleEmployee}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {fnNames.length > 0 ? (
                      fnNames.join(', ')
                    ) : (
                      <span className="text-gray-400">{dict.employees.noFunctionsAssigned}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
