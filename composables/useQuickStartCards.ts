import { computed } from 'vue'
import { useActiveBusiness } from '~/composables/useActiveBusiness'

// Quick-start pills shown in the empty state of any chat surface.
// Adapts to auth + profile_type + business state:
//   0. Logged in as investor                      → investor-focused ecosystem cards
//   1. Anonymous                                  → 4 generic journey-stage cards
//   2. Logged in, no business linked              → starting-focused + a card to link a business
//   3. Logged in, business in idea/early stage    → starting & funding focus
//   4. Logged in, business in growth/established  → growth/scale/exit focus
export type QuickStartCard =
  | { label: string; message: string; to?: never }
  | { label: string; to: string;     message?: never }

export const useQuickStartCards = () => {
  const user = useSupabaseUser()
  const { profile, businesses, activeBusiness } = useActiveBusiness()

  return computed<QuickStartCard[]>(() => {
    // Investor mode short-circuits the founder funnel — these users browse
    // the company database, not state programs for their own business.
    if (profile.value?.profile_type === 'investor') {
      return [
        { label: 'Show me B2B Software companies',            message: 'Show me B2B Software companies in Utah.' },
        { label: 'Which companies are raising Seed funding?', message: 'Which Utah companies are currently raising Seed funding?' },
        { label: "Who's hiring right now?",                   message: 'Which Utah startups are actively hiring right now?' },
        { label: 'Tell me about the Utah FinTech ecosystem',  message: 'Tell me about the Utah FinTech ecosystem.' },
      ]
    }

    if (!user.value) {
      return [
        { label: 'Sign in / create profile',         to: '/login' },
        { label: 'Thinking of starting my business', message: "I'm thinking about starting a business in Utah. Where do I start?" },
        { label: 'Starting my business',             message: "I'm ready to start my business in Utah. What are the steps?" },
        { label: 'Grow my business',                 message: 'I have an existing business in Utah and I want to grow it. What resources are available?' },
        { label: 'Sell or exit my business',         message: "I'm looking to sell or exit my business in Utah. What support is available?" },
      ]
    }

    const list = businesses.value ?? []

    if (!list.length) {
      return [
        { label: 'Thinking of starting my business', message: "I'm thinking about starting a business in Utah. Recommend the best resources for me to get oriented." },
        { label: 'Starting my business',             message: "I'm ready to start my business in Utah. Walk me through the first steps and recommend the right state programs." },
        { label: 'Link my existing business',        to: '/profile' },
      ]
    }

    const business = activeBusiness.value ?? list[0]
    const stage = business.stage
    const where = business.county ? `${business.county} County` : 'Utah'

    if (stage === 'idea' || stage === 'early') {
      return [
        { label: 'Recommended for me right now', message: `Based on my business "${business.name}" (${stage} stage in ${where}, journey step ${business.journey_step}/19), recommend the most relevant Utah state resources I should pursue right now.` },
        { label: 'Early-stage funding',          message: `What funding options (grants, pitch competitions, micro-loans) are available for an ${stage}-stage business in ${where}?` },
        { label: 'Find a mentor or program',     message: `What mentorship programs or accelerators in Utah would be a good fit for my business "${business.name}"?` },
        { label: 'My next journey step',         message: `I'm at journey step ${business.journey_step}/19 with my business "${business.name}". What should I focus on next, and which resources support that step?` },
      ]
    }

    return [
      { label: 'Resources to scale',   message: `My business "${business.name}" is in the ${stage} stage in ${where}. Recommend Utah resources to help me scale.` },
      { label: 'Growth-stage funding', message: `What growth-stage funding (venture capital, growth funds, debt) is available to a ${stage}-stage business in ${where}?` },
      { label: 'Talent & hiring',      message: `What Utah resources can help me find and hire talent for my business "${business.name}"?` },
      { label: 'Plan an exit',         message: `I'm considering selling or exiting "${business.name}". What Utah resources, professional networks, or programs support that?` },
    ]
  })
}
