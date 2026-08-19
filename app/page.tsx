'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Brief } from '@/lib/types'
import LoginPage from './login'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchBriefs()
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchBriefs()
      else setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchBriefs() {
    const { data } = await supabase
      .from('briefs')
      .select('*')
      .order('updated_at', { ascending: false })
    setBriefs(data ?? [])
    setLoading(false)
  }

  async function signIn(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-sm">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onSignIn={signIn} />
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-white font-semibold">Sales Audit Editor</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">{user.email}</span>
          <button onClick={signOut} className="text-gray-400 text-sm hover:text-white transition-colors">Sign out</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-xl font-semibold">Briefs</h2>
        </div>

        {briefs.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-sm">
            No briefs yet. Briefs will appear here once uploaded from Claude Code.
          </div>
        ) : (
          <div className="grid gap-4">
            {briefs.map((brief) => (
              <a
                key={brief.id}
                href={`/brief/${brief.id}`}
                className="block bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">{brief.client_name}</div>
                    <div className="text-gray-400 text-sm mt-1">{brief.prospect_url ?? brief.client_slug}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${brief.published ? 'bg-green-900 text-green-300' : 'bg-gray-800 text-gray-400'}`}>
                      {brief.published ? 'Published' : 'Draft'}
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      {new Date(brief.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
