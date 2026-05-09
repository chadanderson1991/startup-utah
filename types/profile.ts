export type Community = 'Veteran' | 'Women' | 'Rural' | 'Student' | 'Multicultural'
export type BusinessStage = 'idea' | 'early' | 'growth' | 'established'
export type ProfileType = 'entrepreneur' | 'investor'

export interface UserProfile {
  id: string
  full_name: string | null
  county: string | null
  industry: string | null
  communities: Community[]
  bio: string | null
  active_business_id: string | null
  profile_type: ProfileType
  preferred_sectors: string[]
  preferred_stages: string[]
  investment_thesis: string | null
  investor_name: string | null
  created_at: string
  updated_at: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  description: string | null
  stage: BusinessStage
  industry: string | null
  county: string | null
  website: string | null
  year_founded: number | null
  is_hiring: boolean
  journey_step: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type ProfileUpdate  = Partial<Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>>
export type BusinessCreate = Omit<Business, 'id' | 'owner_id' | 'created_at' | 'updated_at'>
export type BusinessUpdate = Partial<BusinessCreate>
