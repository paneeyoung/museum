'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentEmployee } from '@/lib/dal'

export type InviteEmployeeErrorCode =
  | 'errorEmailRequired'
  | 'errorNameRequired'
  | 'errorEmailInUse'
  | 'errorRateLimited'
  | 'errorGeneric'

export type InviteEmployeeState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: InviteEmployeeErrorCode
}

export async function inviteEmployee(
  _prevState: InviteEmployeeState,
  formData: FormData
): Promise<InviteEmployeeState> {
  // service_role (via createAdminClient) bypasses RLS entirely, so this check
  // is the only thing standing between any caller and creating accounts.
  const currentEmployee = await getCurrentEmployee()
  if (!currentEmployee || currentEmployee.role !== 'manager') {
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  const email = formData.get('email')
  const fullName = formData.get('fullName')
  const role = formData.get('role') === 'manager' ? 'manager' : 'employee'
  const functionIds = formData.getAll('functionIds').filter((v): v is string => typeof v === 'string')

  if (typeof email !== 'string' || !email.trim()) {
    return { status: 'error', errorCode: 'errorEmailRequired' }
  }
  if (typeof fullName !== 'string' || !fullName.trim()) {
    return { status: 'error', errorCode: 'errorNameRequired' }
  }

  const adminClient = createAdminClient()

  // Creates the auth.users row; handle_new_user() then auto-creates the
  // matching employees row (role defaults to 'employee', locale to 'en').
  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email.trim(), {
    data: { full_name: fullName.trim() },
  })

  if (error || !data.user) {
    console.error('inviteEmployee failed:', error)
    const message = error?.message.toLowerCase() ?? ''
    if (message.includes('already been registered') || message.includes('already exists')) {
      return { status: 'error', errorCode: 'errorEmailInUse' }
    }
    if (message.includes('rate limit')) {
      return { status: 'error', errorCode: 'errorRateLimited' }
    }
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  const newEmployeeId = data.user.id

  if (role === 'manager') {
    const { error: roleError } = await adminClient
      .from('employees')
      .update({ role: 'manager' })
      .eq('id', newEmployeeId)
    if (roleError) console.error('inviteEmployee role update failed:', roleError)
  }

  if (functionIds.length > 0) {
    const { error: functionsError } = await adminClient
      .from('employee_functions')
      .insert(functionIds.map((functionId) => ({ employee_id: newEmployeeId, function_id: functionId })))
    if (functionsError) console.error('inviteEmployee functions insert failed:', functionsError)
  }

  revalidatePath('/manager/employees')
  return { status: 'success' }
}
