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

const { error } = await supabase
  .from('briefs')
  .update({
    original_html: html,
    edited_html: html,
  })
  .eq('id', 'eade5d6d-efd3-4eac-8ca1-f9eeab8be420')

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('HTML seeded successfully. Size:', Math.round(html.length / 1024) + 'KB')
}
