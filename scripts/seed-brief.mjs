import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://kmdclilvtzgfpcsinalc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZGNsaWx2dHpnZnBjc2luYWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNjUyNTAsImV4cCI6MjEwMjc0MTI1MH0.GKo3Jmpleq8DVUcbM5Bvn5f2SmEJp2gbkKCwcFwTsaU'
)

const sections = {
  exec_summary: {
    hidden: false,
    fields: {
      headline: '21 Years of Craft. Zero Page-1 Presence.',
      subheadline: 'The trust is built. The discoverability isn\'t.',
      biggest_risk: 'Invisible to 2,000+ monthly Contra Costa plumbing searches.',
      structural_gap: '6 Google reviews after 21 years in business is a critical map pack liability.',
      biggest_strength: 'Perfect Google rating, A+ BBB since 2013, CA Licensed #888948 — and 21 years of family reputation.',
      the_business: 'Third-generation family plumber based in Antioch, CA. Founded 2006 — 21 years in business. CA Licensed #888948, bonded and insured. Full-service: plumbing, HVAC, water heaters, repiping, bathroom/kitchen remodeling, leak detection, gas, and emergency service. Serving 15+ cities across Contra Costa County.',
      how_customers_reach_you: 'Primarily referrals and branded search. GBP surfaces for "Christy Plumbing" but not for any city-level service keywords. 30 ranked keywords — 1 on page 1 (branded only). Website offers phone and a contact form only — no chat, SMS, or online scheduling. Evening and weekend leads hit voicemail.',
      ai_readiness: 'Not cited in any AI search platform. Root cause: thin organic footprint (ETV $8/mo), low domain authority (80 backlinks), no structured content targeting "best plumber [city] CA" queries.',
      capacity_coverage: 'Phone + contact form only. Hours are Mon–Fri 8am–5pm with no weekend listing. No live chat, no SMS, no online scheduling, no after-hours intake. 2 of 12 contact channels active.',
    }
  },
  ai_visibility: {
    hidden: false,
    fields: {
      headline: 'Christy Plumbing Isn\'t in the AI Conversation.',
      subheadline: '5 searches. 0 citations. Directories answer instead.',
      summary: '5 searches. 0 AI citations. Branded queries for "Christy Plumbing" return their own website and directory profiles — but for local intent searches like "top plumbers Antioch CA," Christy is absent and directories dominate. The fix isn\'t just a better website — it\'s building the citation depth that AI engines trust.',
    }
  },
  reputation: {
    hidden: false,
    fields: {
      headline: 'Perfect Stars. Paper-Thin Profile.',
      subheadline: '6 reviews after 21 years is a map pack vulnerability.',
    }
  },
  social: {
    hidden: false,
    fields: {
      headline: 'Active on One Platform.',
      subheadline: 'Four channels missing where plumbing jobs get discovered.',
    }
  },
  community: {
    hidden: false,
    fields: {
      headline: 'A 21-Year Story Not Yet Told.',
      subheadline: 'Generational trust that Google can\'t see if it\'s not published.',
    }
  },
  paid_presence: {
    hidden: false,
    fields: {
      headline: 'No Paid Floor Detected.',
      subheadline: '2,000+ monthly searches in Contra Costa — none captured by spend.',
      callout: 'Zero paid presence means zero control over lead volume. Competitors running LSA and Google Search Ads capture every high-intent Contra Costa plumbing search that the organic rankings can\'t reach.',
    }
  },
  keywords: {
    hidden: false,
    fields: {
      headline: '30 Keywords. One on Page 1 — and It\'s Branded.',
      subheadline: 'Every commercial plumbing search in Contra Costa goes elsewhere.',
    }
  },
  comm_channels: {
    hidden: false,
    fields: {
      headline: '2 of 12 Lead Channels Active.',
      subheadline: 'Every unanswered channel is a lead going to a competitor.',
    }
  },
  the_fix: {
    hidden: false,
    fields: {
      opportunity_1_title: 'Build the Page-1 Keyword Foundation',
      opportunity_1_text: 'Target the 15 highest-intent Contra Costa plumbing keywords with optimized landing pages. "Plumber concord" alone is 880 searches/mo at $40 CPC — organic ownership eliminates that cost permanently.',
      opportunity_2_title: 'Close the Review Gap Before a Competitor Does',
      opportunity_2_text: '6 reviews vs. map pack leaders with 100–400+. A structured review campaign over 90 days closes the gap and secures the GBP position before a funded competitor enters the market.',
      opportunity_3_title: 'Open the 10 Lead Channels That Are Dark',
      opportunity_3_text: 'SMS, live chat, online scheduling, and after-hours intake. A plumbing emergency on Saturday currently goes to whoever answers. Christy should be that answer.',
    }
  },
  cta: {
    hidden: false,
    fields: {
      headline: 'Twenty-one years of trust deserves a digital presence that matches.',
      body: 'Contra Costa homeowners are searching for exactly what Christy already delivers. Let\'s make sure they find you.',
    }
  }
}

const { error } = await supabase
  .from('briefs')
  .update({ sections })
  .eq('id', 'eade5d6d-efd3-4eac-8ca1-f9eeab8be420')

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('Brief sections populated successfully.')
}
