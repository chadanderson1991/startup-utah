import Groq from 'groq-sdk'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { ENTREPRENEUR_JOURNEY } from '../../utils/entrepreneur-journey'
import type { UserProfile, Business } from '~/types/profile'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const authUser = await serverSupabaseUser(event)
  if (!authUser) {
    return { greeting: "Hi! I'm the Utah Startup Navigator. I'll help you find the right state programs and resources for your situation. What would you like to work on today?" }
  }

  const { businessId } = await readBody<{ businessId?: string }>(event)
  const client = await serverSupabaseClient(event)

  const [profileRes, bizRes] = await Promise.all([
    client.from('user_profiles').select('*').eq('id', authUser.id).single(),
    businessId
      ? client.from('businesses').select('*').eq('id', businessId).single()
      : Promise.resolve({ data: null }),
  ])

  const profile = profileRes.data as UserProfile | null
  const business = bizRes.data as Business | null

  const contextLines: string[] = []
  if (profile?.full_name) contextLines.push(`User's name: ${profile.full_name}`)
  if (profile?.county)    contextLines.push(`County: ${profile.county}`)
  if (profile?.industry)  contextLines.push(`Industry: ${profile.industry}`)
  if (profile?.communities?.length) contextLines.push(`Communities: ${profile.communities.join(', ')}`)
  if (profile?.bio)       contextLines.push(`Bio: ${profile.bio}`)
  if (business) {
    contextLines.push(`Active business: ${business.name}`)
    contextLines.push(`Business stage: ${business.stage}`)
    contextLines.push(`Currently on journey step ${business.journey_step} of 19`)
    if (business.description) contextLines.push(`Business description: ${business.description}`)
    if (business.notes)       contextLines.push(`Owner notes: ${business.notes}`)
  }

  const groq = new Groq({ apiKey: config.groqApiKey as string })

  const systemPrompt = `You are the Utah Startup Navigator. Generate a short, personalized welcome for a returning user.

${ENTREPRENEUR_JOURNEY}

Rules:
- Greet by name if provided, otherwise just "Welcome back!"
- One sentence max referencing their business and current journey step
- End immediately with a single open question like "What would you like to work on?"
- 2 sentences total — no more
- No bullet points, no headers, no filler phrases like "Great to see you" or "I'm here to help"`

  const userMessage = contextLines.length
    ? `User context:\n${contextLines.join('\n')}`
    : 'No profile information available yet.'

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 256,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    })
    const greeting = completion.choices[0]?.message?.content?.trim()
      ?? "Welcome back! I'm here to help you navigate Utah's startup resources. What would you like to work on today?"
    return { greeting }
  } catch {
    return { greeting: "Welcome back! I'm here to help you navigate Utah's startup resources. What would you like to work on today?" }
  }
})
