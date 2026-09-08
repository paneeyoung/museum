import 'server-only'
import { createClient } from '@supabase/supabase-js'

// service_role bypasses RLS entirely — only use this for operations the
// Data API can't do at all (like deleting an auth user). Every caller MUST
// do its own manager-role check first; there's no RLS backstop here.
export function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
