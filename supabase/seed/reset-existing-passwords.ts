/**
 * One-off script: sets every existing auth user's password to "123456".
 * Run: npm run reset:passwords
 *
 * Requires .env with SUPABASE_URL and a service-role key
 * (NUXT_SUPABASE_SERVICE_KEY, falling back to SUPABASE_SERVICE_KEY).
 */

import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const NEW_PASSWORD = '123456'

const url = process.env.SUPABASE_URL
const serviceKey = process.env.NUXT_SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_KEY

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or service-role key in .env')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

async function main() {
  let page = 1
  const perPage = 200
  let total = 0
  let updated = 0
  const failures: { email: string | undefined; id: string; error: string }[] = []

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
    if (error) {
      console.error(`listUsers failed on page ${page}:`, error.message)
      process.exit(1)
    }
    const users = data?.users ?? []
    if (users.length === 0) break

    for (const u of users) {
      total++
      const { error: updateError } = await supabase.auth.admin.updateUserById(u.id, {
        password: NEW_PASSWORD,
      })
      if (updateError) {
        failures.push({ email: u.email, id: u.id, error: updateError.message })
        console.warn(`  ✗ ${u.email ?? u.id}: ${updateError.message}`)
      } else {
        updated++
        console.log(`  ✓ ${u.email ?? u.id}`)
      }
    }

    if (users.length < perPage) break
    page++
  }

  console.log('')
  console.log(`Done. ${updated}/${total} users updated to password "${NEW_PASSWORD}".`)
  if (failures.length > 0) {
    console.log(`${failures.length} failures:`)
    for (const f of failures) console.log(`  - ${f.email ?? f.id}: ${f.error}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
