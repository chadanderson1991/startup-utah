import { z } from 'zod'

const COMMUNITIES = ['Veteran', 'Women', 'Rural', 'Student', 'Multicultural'] as const
// Covers personal-business stages (idea/early/…) and map-company stages (Pre-Seed/Seed/…)
const STAGES = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Series D+', 'Bootstrapped',
] as const
const UTAH_COUNTIES = [
  'Beaver','Box Elder','Cache','Carbon','Daggett','Davis','Duchesne','Emery','Garfield',
  'Grand','Iron','Juab','Kane','Millard','Morgan','Piute','Rich','Salt Lake','San Juan',
  'Sanpete','Sevier','Summit','Tooele','Uintah','Utah','Wasatch','Washington','Wayne','Weber',
] as const

export const ProfileUpdateSchema = z.object({
  full_name:           z.string().max(200).nullable().optional(),
  county:              z.enum(UTAH_COUNTIES).nullable().optional(),
  industry:            z.string().max(200).nullable().optional(),
  communities:         z.array(z.enum(COMMUNITIES)).optional(),
  bio:                 z.string().max(5000).nullable().optional(),
  active_business_id:  z.string().uuid().nullable().optional(),
  profile_type:        z.enum(['entrepreneur', 'investor']).optional(),
  preferred_sectors:   z.array(z.string().max(100)).optional(),
  preferred_stages:    z.array(z.string().max(100)).optional(),
  investment_thesis:   z.string().max(5000).nullable().optional(),
  investor_name:       z.string().max(200).nullable().optional(),
})

export const BusinessCreateSchema = z.object({
  name:         z.string().min(1).max(200),
  description:  z.string().max(5000).nullable().optional(),
  stage:        z.enum(STAGES),
  industry:     z.string().max(200).nullable().optional(),
  county:       z.string().max(100).nullable().optional(),
  website:      z.string().url().nullable().optional().or(z.literal('')).transform(v => v || null),
  year_founded: z.number().int().min(1800).max(new Date().getFullYear() + 1).nullable().optional(),
  is_hiring:    z.boolean().optional(),
  journey_step: z.number().int().min(1).max(19).optional(),
  notes:        z.string().max(5000).nullable().optional(),
})

export const BusinessUpdateSchema = BusinessCreateSchema.partial()
