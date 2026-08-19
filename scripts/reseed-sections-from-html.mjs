import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const supabase = createClient(
  'https://kmdclilvtzgfpcsinalc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZGNsaWx2dHpnZnBjc2luYWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNjUyNTAsImV4cCI6MjEwMjc0MTI1MH0.GKo3Jmpleq8DVUcbM5Bvn5f2SmEJp2gbkKCwcFwTsaU'
)

const htmlPath = join(dirname(fileURLToPath(import.meta.url)), '../../DRAFTSEOAudit/christy-plumbing-cal-brief/index.html')
const html = readFileSync(htmlPath, 'utf8')

function extract(pattern, group = 1) {
  const m = html.match(pattern)
  return m ? m[group].trim() : ''
}

function extractAll(pattern, group = 1) {
  return [...html.matchAll(pattern)].map(m => m[group].trim())
}

// Strip HTML tags
function strip(s) {
  return s.replace(/<[^>]+>/g, '').trim()
}

const sectionTitles = extractAll(/<h2 class="section-title">([\s\S]*?)<\/h2>/g)

// Exec summary (hero section)
const heroTitle = strip(extract(/<h1 class="hero-title">([\s\S]*?)<\/h1>/))
const heroSub = strip(extract(/<p class="hero-subtitle">([\s\S]*?)<\/p>/))

// Exec summary section title (the h2 one, not the hero h1)
const execH2 = strip(sectionTitles[0] || '')
// Split on <br> to get headline + subheadline
const execParts = (extract(/<h2 class="section-title">([\s\S]*?)<\/h2>/) || '').split(/<br[^>]*>/)
const execHeadline = strip(execParts[0] || '')
const execSub = strip(execParts[1] || '')

const sections = {
  exec_summary: {
    hidden: false,
    fields: {
      hero_headline: heroTitle,
      hero_subheadline: heroSub,
      section_headline: execHeadline,
      section_subheadline: execSub,
    }
  },
  ai_visibility: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[1]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[1]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  reputation: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[2]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[2]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  social: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[3]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[3]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  community: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[4]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[4]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  paid_presence: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[5]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[5]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  keywords: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[6]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[6]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  comm_channels: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[7]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[7]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  the_fix: {
    hidden: false,
    fields: {
      headline: strip(sectionTitles[8]?.split(/<br[^>]*>/)[0] || ''),
      subheadline: strip(sectionTitles[8]?.split(/<br[^>]*>/)[1] || ''),
    }
  },
  cta: {
    hidden: false,
    fields: {}
  }
}

// Print what we extracted for verification
for (const [key, val] of Object.entries(sections)) {
  console.log(`\n[${key}]`)
  for (const [f, v] of Object.entries(val.fields)) {
    console.log(`  ${f}: ${v.slice(0, 80)}`)
  }
}

const { error } = await supabase
  .from('briefs')
  .update({ sections })
  .eq('id', 'eade5d6d-efd3-4eac-8ca1-f9eeab8be420')

if (error) {
  console.error('\nError:', error.message)
} else {
  console.log('\nSections re-seeded from HTML successfully.')
}
