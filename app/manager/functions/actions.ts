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

  // New functions always append after whatever the current highest
  // sort_order is, so they land at the bottom of the list/grid rather than
  // wherever alphabetical order would have put them.
  const { data: highest, error: highestError } = await supabase
    .from('functions')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (highestError) console.error('addFunction failed to read current max sort_order:', highestError)

  const { error } = await supabase
    .from('functions')
    .insert({ name: name.trim(), sort_order: (highest?.sort_order ?? -1) + 1 })

  if (error) {
    if (error.code === '23505') {
      return { status: 'error', errorCode: 'errorDuplicate' }
    }
    return { status: 'error', errorCode: 'errorGeneric' }
  }

  revalidatePath('/manager/functions')
  return { status: 'success' }
}

export type MoveFunctionDirection = 'up' | 'down'

// Reordering swaps sort_order with whichever neighbor is being stepped
// over, rather than renumbering the whole list — cheaper and avoids any
// window where two functions briefly share a sort_order.
export async function moveFunction(id: string, direction: MoveFunctionDirection) {
  const supabase = await createClient()

  const { data: functions, error: fetchError } = await supabase
    .from('functions')
    .select('id, sort_order')
    .order('sort_order')
  if (fetchError) console.error('moveFunction failed to read functions:', fetchError)
  if (!functions) return

  const index = functions.findIndex((f) => f.id === id)
  if (index === -1) return

  const swapIndex = direction === 'up' ? index - 1 : index + 1
  if (swapIndex < 0 || swapIndex >= functions.length) return

  const current = functions[index]
  const neighbor = functions[swapIndex]

  const [{ error: currentError }, { error: neighborError }] = await Promise.all([
    supabase.from('functions').update({ sort_order: neighbor.sort_order }).eq('id', current.id),
    supabase.from('functions').update({ sort_order: current.sort_order }).eq('id', neighbor.id),
  ])

  if (currentError || neighborError) {
    console.error('moveFunction failed:', currentError ?? neighborError)
    return
  }

  revalidatePath('/manager/functions')
  revalidatePath('/manager/schedule')
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
