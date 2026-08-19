'use client'

import { useState } from 'react'

export default function LoginPage({ onSignIn }: { onSignIn: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.endsWith('@scorpion.co')) {
      setError('You must use a @scorpion.co email address.')
      return
    }

    setLoading(true)
    try {
      await onSignIn(email)
      setSent(true)
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-sm px-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Sales Audit Editor</h1>
          <p className="text-gray-400 text-sm">Sign in with your Scorpion email</p>
        </div>

        {sent ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-green-400 text-sm font-medium mb-2">Check your email</div>
            <p className="text-gray-400 text-sm">We sent a sign-in link to <span className="text-white">{email}</span>. Click the link to continue.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@scorpion.co"
                required
                className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-gray-900 py-3 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send sign-in link'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
