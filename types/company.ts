export interface Company {
  id: string
  name: string
  description: string | null
  website: string | null
  linkedin_url: string | null
  address: string | null
  lat: number | null
  lng: number | null
  city: string | null
  sector: string | null
  stage: string | null
  employee_range: string | null
  year_founded: number | null
  is_hiring: boolean
  job_postings: { title: string; url: string; posted_at: string }[]
  photos: string[]
  is_verified: boolean
  is_active: boolean
  claimed_by: string | null
  owner_email: string | null
  journey_step: number | null
  notes: string | null
  industry: string | null
  county: string | null
  created_at: string
  updated_at: string
}

export interface CompanyFilters {
  search: string
  sectors: string[]
  stages: string[]
  employee_ranges: string[]
  is_hiring: boolean | null
}

export interface CompanyClaim {
  id: string
  company_id: string
  user_id: string
  verification_note: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
