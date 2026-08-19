export type Brief = {
  id: string
  created_at: string
  updated_at: string
  created_by: string
  client_name: string
  client_slug: string
  prospect_url: string | null
  expires_at: string | null
  published: boolean
  sections: Record<string, BriefSection>
  original_html: string | null
  edited_html: string | null
}

export type BriefSection = {
  hidden: boolean
  fields: Record<string, string>
}

export type BriefChange = {
  id: string
  created_at: string
  brief_id: string
  changed_by: string
  section_key: string
  field: string
  old_value: string | null
  new_value: string | null
}
