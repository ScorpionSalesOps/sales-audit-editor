'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Brief } from '@/lib/types'

export default function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [])

  useEffect(() => {
    if (id) fetchBrief()
  }, [id])

  async function fetchBrief() {
    const { data, error } = await supabase
      .from('briefs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      setNotFound(true)
    } else {
      setBrief(data)
    }
    setLoading(false)
  }

  async function saveSection(sectionKey: string, field: string, oldValue: string, newValue: string) {
    if (!brief || oldValue === newValue) return
    setSaving(true)

    const updatedSections = {
      ...brief.sections,
      [sectionKey]: {
        ...brief.sections[sectionKey],
        fields: {
          ...brief.sections[sectionKey]?.fields,
          [field]: newValue
        }
      }
    }

    await supabase.from('briefs').update({
      sections: updatedSections,
      updated_at: new Date().toISOString()
    }).eq('id', brief.id)

    await supabase.from('brief_changes').insert({
      brief_id: brief.id,
      changed_by: 'seller',
      section_key: sectionKey,
      field,
      old_value: oldValue,
      new_value: newValue
    })

    setBrief({ ...brief, sections: updatedSections })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function toggleSection(sectionKey: string) {
    if (!brief) return
    const current = brief.sections[sectionKey]?.hidden ?? false
    const updatedSections = {
      ...brief.sections,
      [sectionKey]: {
        ...brief.sections[sectionKey],
        hidden: !current
      }
    }
    await supabase.from('briefs').update({
      sections: updatedSections,
      updated_at: new Date().toISOString()
    }).eq('id', brief.id)
    setBrief({ ...brief, sections: updatedSections })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-sm">Loading brief...</div>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-lg font-medium mb-2">Brief not found</div>
          <div className="text-gray-400 text-sm">This link may be invalid or expired.</div>
        </div>
      </div>
    )
  }

  const sections = [
    { key: 'exec_summary', label: 'Exec Summary' },
    { key: 'ai_visibility', label: 'AI Visibility' },
    { key: 'reputation', label: 'Reputation' },
    { key: 'social', label: 'Social Footprint' },
    { key: 'community', label: 'Community' },
    { key: 'paid_presence', label: 'Paid Presence' },
    { key: 'keywords', label: 'Keywords' },
    { key: 'comm_channels', label: 'Comm Channels' },
    { key: 'the_fix', label: 'The Fix' },
    { key: 'cta', label: 'CTA Banner' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-gray-950 z-10">
        <div>
          <h1 className="text-white font-semibold">{brief!.client_name}</h1>
          <div className="text-gray-500 text-xs mt-0.5">{brief!.prospect_url}</div>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-gray-400 text-xs">Saving...</span>}
          {saved && <span className="text-green-400 text-xs">Saved</span>}
          <a
            href={`https://${brief!.client_slug}.netlify.app`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Live Brief
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <p className="text-gray-400 text-sm mb-6">Edit section text or hide sections that are not relevant to this prospect.</p>

        {sections.map((section) => {
          const sectionData = brief!.sections[section.key]
          const isHidden = sectionData?.hidden ?? false
          const fields = sectionData?.fields ?? {}

          return (
            <div key={section.key} className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${isHidden ? 'border-gray-800 opacity-50' : 'border-gray-700'}`}>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-white font-medium text-sm">{section.label}</span>
                <button
                  onClick={() => toggleSection(section.key)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${isHidden ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                >
                  {isHidden ? 'Hidden' : 'Visible'}
                </button>
              </div>

              {!isHidden && Object.keys(fields).length > 0 && (
                <div className="px-5 pb-5 space-y-3 border-t border-gray-800 pt-4">
                  {Object.entries(fields).map(([field, value]) => (
                    <div key={field}>
                      <label className="text-gray-500 text-xs mb-1 block capitalize">{field.replace(/_/g, ' ')}</label>
                      <textarea
                        defaultValue={value}
                        onBlur={(e) => saveSection(section.key, field, value, e.target.value)}
                        rows={2}
                        className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {!isHidden && Object.keys(fields).length === 0 && (
                <div className="px-5 pb-4 text-gray-600 text-xs border-t border-gray-800 pt-3">
                  No editable fields in this section yet.
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
