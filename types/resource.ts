export interface Resource {
  id: number
  title: string
  description: string | null
  link: string | null
  email: string | null
  communities: string[]
  industries: string[]
  locations: string[]
  topics: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ResourceFilters {
  search: string
  communities: string[]
  industries: string[]
  locations: string[]
  topics: string[]
}
