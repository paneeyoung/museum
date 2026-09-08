'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary } from '@/lib/i18n/dictionaries'

export default function LoginForm({ dict }: { dict: Dictionary['login'] }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const trimmedName = name.trim()
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        // Only used the very first time this email signs in (that's when the
        // employees row gets created) — omit entirely when blank so it
        // doesn't overwrite anything with an empty string.
        ...(trimmedName ? { data: { full_name: trimmedName } } : {}),
      },
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
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
        <p className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          {dict.sentMessage.replace('{email}', email)}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder={dict.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
          />
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
