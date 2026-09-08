'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentEmployee } from '@/lib/dal'

export type SaveEmployeeFunctionsState = {
  status: 'idle' | 'success' | 'error'
}

export type UpdateEmployeeNameErrorCode = 'errorNameRequired' | 'errorGeneric'

export type UpdateEmployeeNameState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: UpdateEmployeeNameErrorCode
}

export async function updateEmployeeName(
  employeeId: string,
  _prevState: UpdateEmployeeNameState,
  formData: FormData
): Promise<UpdateEmployeeNameState> {
  const fullName = formData.get('fullName')
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return { status: 'error', errorCode: 'errorNameRequired' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('employees')
    .update({ full_name: fullName.trim() })
    .eq('id', employeeId)

  if (error) {
    console.error('updateEmployeeName failed:', error)
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath(`/manager/employees/${employeeId}`)
  revalidatePath('/manager/employees')
  return { status: 'success' }
}

export type DeleteEmployeeErrorCode = 'errorCannotDeleteSelf' | 'errorGeneric'

export type DeleteEmployeeResult =
  | { status: 'success' }
  | { status: 'error'; errorCode: DeleteEmployeeErrorCode }

export async function deleteEmployee(employeeId: string): Promise<DeleteEmployeeResult> {
  // service_role (via createAdminClient) bypasses RLS entirely, so this check
  // is the only thing standing between any caller and deleting any account.
  const currentEmployee = await getCurrentEmployee()
  if (!currentEmployee || currentEmployee.role !== 'manager') {
    return { status: 'error', errorCode: 'errorGeneric' }
  }
  if (currentEmployee.id === employeeId) {
    return { status: 'error', errorCode: 'errorCannotDeleteSelf' }
  }

  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(employeeId)
  if (error) {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/employees')
  return { status: 'success' }
}

export async function saveEmployeeFunctions(
  employeeId: string,
  _prevState: SaveEmployeeFunctionsState,
  formData: FormData
): Promise<SaveEmployeeFunctionsState> {
  const functionIds = formData.getAll('functionIds').filter((v): v is string => typeof v === 'string')

  const supabase = await createClient()

  const { error: deleteError } = await supabase
    .from('employee_functions')
    .delete()
    .eq('employee_id', employeeId)

  if (deleteError) {
    return { status: 'error' }
  }

  if (functionIds.length > 0) {
    const { error: insertError } = await supabase
      .from('employee_functions')
      .insert(functionIds.map((functionId) => ({ employee_id: employeeId, function_id: functionId })))

    if (insertError) {
      return { status: 'error' }
    }
  }

  revalidatePath(`/manager/employees/${employeeId}`)
  revalidatePath('/manager/employees')
  return { status: 'success' }
}
