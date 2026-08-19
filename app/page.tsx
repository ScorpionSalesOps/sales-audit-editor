'use client'

import { useState } from 'react'

const ACCESS_PASSWORD = 'Scorpy26*'

export default function Home() {
  const [password, setPassword] = useState('')
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === ACCESS_PASSWORD) {
      setAuthed(true)
    } else {
      setError('Incorrect password.')
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Sales Audit Editor</h1>
            <p className="text-gray-400 text-sm">Enter the team password to continue</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-500"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <button
              type="submit"
              className="w-full bg-white text-gray-900 py-3 rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-white font-semibold">Sales Audit Editor</h1>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="text-center py-20 text-gray-500 text-sm">
          No briefs yet. Briefs will appear here once uploaded from Claude Code.
        </div>
      </main>
    </div>
  )
}
