'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Brief } from '@/lib/types'

const SECTION_ANCHORS: Record<string, string> = {
  exec_summary: '#exec-summary',
  ai_visibility: '#ai-visibility',
  reputation: '#reputation',
  social: '#social',
  community: '#community',
  paid_presence: '#paid-presence',
  keywords: '#keywords',
  comm_channels: '#comm-channels',
  the_fix: '#opportunities',
  cta: '#cta-banner',
}

const SECTION_IDS = ['exec-summary','ai-visibility','reputation','social','community','paid-presence','keywords','comm-channels','opportunities']

function buildIframeHtml(html: string) {
  const script = `
<script>
(function(){
  var ids = ${JSON.stringify(SECTION_IDS)};
  function scrollTop(){
    return window.scrollY||window.pageYOffset||document.documentElement.scrollTop||document.body.scrollTop||0;
  }
  function getActive(){
    var top = scrollTop();
    var active = ids[0];
    ids.forEach(function(id){
      var el = document.getElementById(id);
      if(!el) return;
      var abs = el.getBoundingClientRect().top + top;
      if(abs <= top + 200) active = id;
    });
    window.parent.postMessage({briefSection: active}, '*');
  }
  // Listen everywhere — different browsers use different scroll containers
  window.addEventListener('scroll', getActive, {passive:true});
  document.addEventListener('scroll', getActive, {passive:true, capture:true});
  document.body.addEventListener('scroll', getActive, {passive:true});
  document.documentElement.addEventListener('scroll', getActive, {passive:true});
  setTimeout(getActive, 800);
})();
<\/script>`
  return html.replace('</body>', script + '</body>')
}

export default function BriefPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('exec_summary')
  const [iframeHtml, setIframeHtml] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const currentValues = useRef<Record<string, Record<string, string>>>({})

  useEffect(() => {
    params.then(p => setId(p.id))
  }, [])

  useEffect(() => {
    if (id) fetchBrief()
  }, [id])

  useEffect(() => {
    if (brief?.edited_html) {
      setIframeHtml(buildIframeHtml(brief.edited_html))
    }
  }, [brief?.edited_html])

  // Listen for section updates posted from inside the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data?.briefSection) return
      const anchor = '#' + e.data.briefSection
      const key = Object.entries(SECTION_ANCHORS).find(([, a]) => a === anchor)?.[0]
      if (key) setActiveSection(key)
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Scroll right panel when active section changes
  useEffect(() => {
    sectionRefs.current[activeSection]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeSection])

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
      // Seed currentValues so re-edits use the latest saved value as oldValue
      for (const [sk, sv] of Object.entries(data.sections as Brief['sections'])) {
        currentValues.current[sk] = { ...sv.fields }
      }
    }
    setLoading(false)
  }

  async function saveSection(sectionKey: string, field: string, newValue: string) {
    if (!brief) return
    const oldValue = currentValues.current[sectionKey]?.[field] ?? ''
    if (oldValue === newValue) return
    setSaving(true)

    // Update ref immediately so re-edits use the new value as oldValue
    if (!currentValues.current[sectionKey]) currentValues.current[sectionKey] = {}
    currentValues.current[sectionKey][field] = newValue

    const updatedSections = {
      ...brief.sections,
      [sectionKey]: {
        ...brief.sections[sectionKey],
        fields: { ...brief.sections[sectionKey]?.fields, [field]: newValue }
      }
    }

    const updatedHtml = brief.edited_html
      ? brief.edited_html.replace(oldValue, newValue)
      : brief.edited_html

    await supabase.from('briefs').update({
      sections: updatedSections,
      edited_html: updatedHtml,
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

    setBrief({ ...brief, sections: updatedSections, edited_html: updatedHtml })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function toggleSection(sectionKey: string) {
    if (!brief) return
    const current = brief.sections[sectionKey]?.hidden ?? false
    const anchor = SECTION_ANCHORS[sectionKey]
    const sectionId = anchor?.slice(1)

    let updatedHtml = brief.edited_html ?? ''
    if (sectionId && updatedHtml) {
      if (!current) {
        // Hide: add display:none to the opening section tag with this id
        updatedHtml = updatedHtml.replace(
          new RegExp(`(<section[^>]*id="${sectionId}"[^>]*)(>)`),
          '$1 style="display:none"$2'
        )
      } else {
        // Show: remove the display:none we added
        updatedHtml = updatedHtml.replace(
          new RegExp(`(<section[^>]*id="${sectionId}"[^>]*) style="display:none"(>)`),
          '$1$2'
        )
      }
    }

    const updatedSections = {
      ...brief.sections,
      [sectionKey]: { ...brief.sections[sectionKey], hidden: !current }
    }
    await supabase.from('briefs').update({
      sections: updatedSections,
      edited_html: updatedHtml,
      updated_at: new Date().toISOString()
    }).eq('id', brief.id)
    setBrief({ ...brief, sections: updatedSections, edited_html: updatedHtml })
  }

  function downloadBrief() {
    if (!brief?.edited_html) return
    const blob = new Blob([brief.edited_html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${brief.client_slug}-brief.html`
    a.click()
    URL.revokeObjectURL(url)
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
    <div className="h-screen bg-gray-950 flex flex-col">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-white font-semibold">{brief!.client_name}</h1>
          <div className="text-gray-500 text-xs mt-0.5">{brief!.prospect_url}</div>
        </div>
        <div className="flex items-center gap-3">
          {saving && <span className="text-gray-400 text-xs">Saving...</span>}
          {saved && <span className="text-green-400 text-xs">Saved</span>}
          <button
            onClick={downloadBrief}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            Download Brief
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Brief preview */}
        <div className="w-[62%] flex-shrink-0 border-r border-gray-800 overflow-hidden">
          {iframeHtml ? (
            <iframe
              ref={iframeRef}
              srcDoc={iframeHtml}
              className="w-full h-full"
              title="Brief Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600 text-sm">
              Brief HTML not uploaded yet.
            </div>
          )}
        </div>

        {/* Right: Editor panel */}
        <div className="flex-1 overflow-y-auto bg-gray-950">
          <div className="p-4 space-y-3">
            <p className="text-gray-500 text-xs mb-4">Edit any field — changes save automatically. Download the brief when ready.</p>

            {sections.map((section) => {
              const sectionData = brief!.sections[section.key]
              const isHidden = sectionData?.hidden ?? false
              const fields = sectionData?.fields ?? {}
              const isActive = activeSection === section.key

              return (
                <div
                  key={section.key}
                  ref={el => { sectionRefs.current[section.key] = el }}
                  className={`bg-gray-900 border rounded-xl overflow-hidden transition-all ${isActive ? 'border-blue-600' : isHidden ? 'border-gray-800 opacity-50' : 'border-gray-700'}`}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => setActiveSection(section.key)}
                  >
                    <span className="text-white font-medium text-sm">{section.label}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleSection(section.key) }}
                      className={`text-xs px-2.5 py-1 rounded-full transition-colors ${isHidden ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                    >
                      {isHidden ? 'Hidden' : 'Visible'}
                    </button>
                  </div>

                  {isActive && !isHidden && Object.keys(fields).length > 0 && (
                    <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                      {Object.entries(fields).map(([field, value]) => (
                        <div key={field}>
                          <label className="text-gray-500 text-xs mb-1 block capitalize">{field.replace(/_/g, ' ')}</label>
                          <textarea
                            defaultValue={value}
                            onBlur={(e) => saveSection(section.key, field, e.target.value)}
                            rows={2}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-gray-500 resize-none"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
