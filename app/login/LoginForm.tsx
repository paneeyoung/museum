'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Mode = 'magiclink' | 'password' | 'forgotPassword'
type Status = 'idle' | 'sending' | 'sent' | 'error'

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none'
const primaryButtonClass = 'w-full rounded-md bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50'
const linkButtonClass = 'text-sm text-gray-500 hover:text-gray-700 hover:underline'

export default function LoginForm({ dict }: { dict: Dictionary['login'] }) {
  const [mode, setMode] = useState<Mode>('magiclink')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  function switchMode(next: Mode) {
    setMode(next)
    setStatus('idle')
    setErrorMessage('')
  }

  async function handleMagicLinkSubmit(e: React.FormEvent) {
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

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus('error')
      setErrorMessage(error.code === 'invalid_credentials' ? dict.errorInvalidCredentials : error.message)
      return
    }

    // Full navigation rather than a client-side route change — the landing
    // page is chosen server-side by role (see app/page.tsx), which needs a
    // fresh request to see the session cookie signInWithPassword just set.
    window.location.href = '/'
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    const supabase = createClient()
    // Reuses the existing /auth/callback code-exchange route via `next`,
    // same as any other post-login redirect — it lands the now-authenticated
    // user straight on the set-password form instead of their usual homepage.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/account/password`,
    })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message)
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    const message = mode === 'forgotPassword' ? dict.forgotPasswordSentMessage : dict.sentMessage
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{dict.title}</h1>
        </div>
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
          <p>{message.replace('{email}', email)}</p>
          <p className="mt-2 font-bold">{dict.spamNotice}</p>
        </div>
        <button type="button" onClick={() => switchMode('magiclink')} className={linkButtonClass}>
          {dict.backToLogin}
        </button>
      </div>
    )
  }

  if (mode === 'forgotPassword') {
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{dict.forgotPasswordTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{dict.forgotPasswordSubtitle}</p>
        </div>
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder={dict.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={status === 'sending'} className={primaryButtonClass}>
            {status === 'sending' ? dict.forgotPasswordSending : dict.forgotPasswordSendButton}
          </button>
          {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
        <div className="text-center">
          <button type="button" onClick={() => switchMode('password')} className={linkButtonClass}>
            {dict.backToLogin}
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'password') {
    return (
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">{dict.passwordTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{dict.passwordSubtitle}</p>
        </div>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder={dict.emailPlaceholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            placeholder={dict.passwordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={status === 'sending'} className={primaryButtonClass}>
            {status === 'sending' ? dict.signingIn : dict.signInButton}
          </button>
          {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => switchMode('forgotPassword')} className={linkButtonClass}>
            {dict.forgotPasswordLink}
          </button>
          <button type="button" onClick={() => switchMode('magiclink')} className={linkButtonClass}>
            {dict.useMagicLinkInstead}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{dict.title}</h1>
        <p className="mt-1 text-sm text-gray-500">{dict.subtitle}</p>
      </div>
      <form onSubmit={handleMagicLinkSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder={dict.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <button type="submit" disabled={status === 'sending'} className={primaryButtonClass}>
          {status === 'sending' ? dict.sending : dict.sendButton}
        </button>
        {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
      </form>
      <div className="text-center">
        <button type="button" onClick={() => switchMode('password')} className={linkButtonClass}>
          {dict.usePasswordInstead}
        </button>
      </div>
    </div>
  )
}
