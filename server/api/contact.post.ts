import { createError, defineEventHandler, readBody } from 'h3'

interface ContactBody {
  name: string
  email: string
  subject?: string
  message: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<ContactBody>(event)

  if (!body.name?.trim() || !body.email?.trim() || !body.message?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name, email, and message are required' })
  }

  const config = useRuntimeConfig()

  // Send via Resend (or fall back to a log if not configured)
  const resendKey = config.resendApiKey as string | undefined
  if (resendKey) {
    await $fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Startup State Utah <noreply@startup.utah.gov>',
        to: ['startups@utah.gov'],
        reply_to: body.email,
        subject: body.subject?.trim() || `Contact form message from ${body.name}`,
        text: `Name: ${body.name}\nEmail: ${body.email}\n\n${body.message}`,
      }),
    })
  } else {
    // No email provider configured — log for now
    console.log('[contact]', { name: body.name, email: body.email, subject: body.subject, message: body.message })
  }

  return { success: true }
})
