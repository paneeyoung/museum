'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Dictionary } from '@/lib/i18n/dictionaries'

const MIN_PASSWORD_LENGTH = 8

const inputClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none'
const primaryButtonClass =
  'w-full rounded-full bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50'

export default function SetPasswordForm({ dict }: { dict: Dictionary['account'] }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMessage('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setStatus('error')
      setErrorMessage(dict.errorPasswordTooShort)
      return
    }
    if (password !== confirmPassword) {
      setStatus('error')
      setErrorMessage(dict.errorPasswordMismatch)
      return
    }

    setStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setStatus('error')
      setErrorMessage(error.message || dict.errorGeneric)
    } else {
      setStatus('success')
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{dict.setPasswordTitle}</h1>
        <p className="mt-1 text-sm text-gray-500">{dict.setPasswordSubtitle}</p>
      </div>

      {status === 'success' ? (
        <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">{dict.setPasswordSuccess}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-md">
          <input
            type="password"
            required
            placeholder={dict.newPasswordPlaceholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <input
            type="password"
            required
            placeholder={dict.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClass}
          />
          <button type="submit" disabled={status === 'saving'} className={primaryButtonClass}>
            {status === 'saving' ? dict.settingPassword : dict.setPasswordButton}
          </button>
          {status === 'error' && <p className="text-sm text-red-600">{errorMessage}</p>}
        </form>
      )}
    </div>
  )
}
