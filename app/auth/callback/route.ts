import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      let destination = next
      if (!destination) {
        const { data: employee } = await supabase
          .from('employees')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle()
        destination = employee?.role === 'manager' ? '/manager/availability' : '/employee/availability'
      }
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
