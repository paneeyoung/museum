'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AddFunctionErrorCode = 'errorNameRequired' | 'errorDuplicate' | 'errorGeneric'

export type AddFunctionState = {
  status: 'idle' | 'success' | 'error'
  errorCode?: AddFunctionErrorCode
}

export async function addFunction(
  _prevState: AddFunctionState,
  formData: FormData
): Promise<AddFunctionState> {
  const name = formData.get('name')
  if (typeof name !== 'string' || !name.trim()) {
    return { status: 'error', errorCode: 'errorNameRequired' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('functions').insert({ name: name.trim() })

  if (error) {
    if (error.code === '23505') {
      return { status: 'error', errorCode: 'errorDuplicate' }
    }
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/functions')
  return { status: 'success' }
}

export async function deleteFunction(id: string) {
  const supabase = await createClient()
  await supabase.from('functions').delete().eq('id', id)
  revalidatePath('/manager/functions')
  revalidatePath('/manager/schedule')
}

export type UpdateFunctionNameResult =
  | { status: 'success' }
  | { status: 'error'; errorCode: 'errorDuplicate' | 'errorGeneric' }

export async function updateFunctionName(
  functionId: string,
  name: string
): Promise<UpdateFunctionNameResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('functions').update({ name }).eq('id', functionId)

  if (error) {
    console.error('updateFunctionName failed:', error)
    if (error.code === '23505') {
      return { status: 'error', errorCode: 'errorDuplicate' }
    }
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/functions')
  revalidatePath('/manager/schedule')
  return { status: 'success' }
}
