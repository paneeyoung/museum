'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function LoginForm({ dict }: { dict: Dictionary['login'] }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Accounts are only ever created via the manager's invite flow now —
        // never implicitly at login — so a pre-invited-only workforce can't
        // end up with duplicate accounts from typos in self-entered emails.
        shouldCreateUser: false,
      },
    })

    if (error) {
      setStatus('error')
      // GoTrue's code for "no existing user and shouldCreateUser is false".
      setErrorMessage(error.code === 'otp_disabled' ? dict.errorNotInvited : error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{dict.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{dict.subtitle}</p>
      </div>

      {status === 'sent' ? (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          <p>{dict.sentMessage.replace('{email}', email)}</p>
          <p className="mt-2 font-bold">{dict.spamNotice}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder={dict.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {status === 'sending' ? dict.sending : dict.sendButton}
          </button>
          {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
      )}
    </div>
  )
}
