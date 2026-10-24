'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Reset link sent. Please check your email (and spam folder).')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-96 rounded-lg bg-white p-8 shadow-md"
      >
        <h1 className="mb-2 text-center text-2xl font-bold text-black">
          Forgot Password
        </h1>

        <p className="mb-6 text-center text-sm text-gray-600">
          Enter your registered email and we will send you a reset link.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-500">{error}</p>
        )}

        {message && (
          <p className="mb-4 text-sm text-green-600">{message}</p>
        )}

        {/* EMAIL */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-black">
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-black"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        <p className="mt-4 text-center text-sm text-black">
          Remember your password?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </form>
    </div>
  )
}