import { redirect } from 'next/navigation'
import { getCurrentEmployee } from '@/lib/dal'

// Anonymous visitors never reach here — the proxy (lib/supabase/proxy.ts)
// already redirects them to /login before this page renders. So by the
// time we get here there's always a logged-in employee; just send them to
// their own landing page based on role.
export default async function Home() {
  const employee = await getCurrentEmployee()
  if (!employee) redirect('/login')
  if (employee.role === 'manager') redirect('/manager/schedule')
  redirect('/employee/availability')
}
