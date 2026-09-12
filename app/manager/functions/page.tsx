import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/server'
import { getDictionary } from '@/lib/i18n/dictionaries'
import AddFunctionForm from './AddFunctionForm'
import FunctionNameField from './FunctionNameField'
import FunctionReorderButtons from './FunctionReorderButtons'
import DeleteFunctionButton from './DeleteFunctionButton'

export default async function FunctionsPage() {
  const locale = await getLocale()
  const dict = getDictionary(locale)

  const supabase = await createClient()
  const [{ data: functions, error: functionsError }, { data: employeeFunctions }] = await Promise.all([
    supabase.from('functions').select('id, name').order('sort_order'),
    supabase.from('employee_functions').select('function_id'),
  ])
  if (functionsError) console.error('Failed to load functions:', functionsError)

  const assignedCountByFunction = new Map<string, number>()
  for (const row of employeeFunctions ?? []) {
    assignedCountByFunction.set(row.function_id, (assignedCountByFunction.get(row.function_id) ?? 0) + 1)
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-xl font-semibold text-gray-900">{dict.functions.title}</h1>
      <p className="mt-1 text-sm text-gray-500">{dict.functions.subtitle}</p>

      <div className="mt-6">
        <AddFunctionForm dict={dict} />
      </div>

      <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200">
        {(functions ?? []).length === 0 && (
          <li className="p-4 text-sm text-gray-500">{dict.functions.noFunctionsYet}</li>
        )}
        {(functions ?? []).map((f, i) => (
          <li key={f.id} className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <FunctionReorderButtons
                functionId={f.id}
                disableUp={i === 0}
                disableDown={i === (functions ?? []).length - 1}
                dict={dict}
              />
              <FunctionNameField functionId={f.id} name={f.name} dict={dict} />
            </div>
            <DeleteFunctionButton
              functionId={f.id}
              functionName={f.name}
              assignedCount={assignedCountByFunction.get(f.id) ?? 0}
              dict={dict}
            />
          </li>
        ))}
      </ul>
    </main>
  )
}
