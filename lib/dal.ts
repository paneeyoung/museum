import 'server-only'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getCurrentEmployee = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from('employees')
    .select('id, full_name, email, role, locale')
    .eq('id', user.id)
    .maybeSingle()

  return data
})
