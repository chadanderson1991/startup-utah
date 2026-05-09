import Anthropic from '@anthropic-ai/sdk'
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { UserProfile } from '~/types/profile'
import type { Company } from '~/types/company'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // serverSupabaseUser throws "Auth session missing!" for anonymous users.
  let authUser: Awaited<ReturnType<typeof serverSupabaseUser>> | null = null
  try {
    authUser = await serverSupabaseUser(event)
  } catch {
    authUser = null
  }

  if (!authUser) {
    return { greeting: "Hi! I'm Startup Sprig. Tell me about your business and I'll point you to the right state programs and resources." }
  }

  const { businessId } = await readBody<{ businessId?: string }>(event)
  const client = await serverSupabaseClient(event)

  const [profileRes, bizRes] = await Promise.all([
    client.from('user_profiles').select('*').eq('id', authUser.id).single(),
    businessId
      ? client.from('companies').select('*').eq('id', businessId).single()
      : Promise.resolve({ data: null }),
  ])

  const profile = profileRes.data as UserProfile | null
  const business = bizRes.data as Company | null

  if (profile?.profile_type === 'investor') {
    const name = profile.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''
    return { greeting: `Hi${name}! How can I help you today?` }
  }

  const contextLines: string[] = []
  if (profile?.full_name)           contextLines.push(`Name: ${profile.full_name}`)
  if (business?.name)               contextLines.push(`Business: ${business.name}`)
  if (business?.stage)              contextLines.push(`Stage: ${business.stage}`)
  if (business?.journey_step)       contextLines.push(`Journey step: ${business.journey_step} of 19`)
  if (business?.description)        contextLines.push(`Description: ${business.description}`)

  // No profile data available — return a static greeting to save tokens entirely
  if (!contextLines.length) {
    return { greeting: "Welcome back! I'm here to help you find Utah state resources for your business. What are you working on?" }
  }

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey as string })

  try {
    const completion = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      system: 'You are Startup Sprig. Write a 1-2 sentence personalized welcome for a returning user. Greet by first name if provided. Reference their business name and current journey step number if available. End with one short open question like "What would you like to work on?" No filler phrases.',
      messages: [{ role: 'user', content: contextLines.join('\n') }],
    })

    const greeting = completion.content[0]?.type === 'text'
      ? completion.content[0].text.trim()
      : null

    return { greeting: greeting ?? "Welcome back! What would you like to work on today?" }
  } catch {
    return { greeting: "Welcome back! I'm here to help you navigate Utah's startup resources. What would you like to work on?" }
  }
})
