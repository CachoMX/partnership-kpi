import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import * as path from 'path'

config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const GENERIC_PASSWORD = 'Closers2024!'

async function createAllUsers() {
  console.log('🚀 Starting user creation process...\n')

  // Fetch all closers
  const { data: closers, error: closersError } = await supabase
    .from('closers')
    .select('id, name, email')

  if (closersError) {
    console.error('Error fetching closers:', closersError)
    return
  }

  // Fetch all setters
  const { data: setters, error: settersError } = await supabase
    .from('setters')
    .select('id, name, email')

  if (settersError) {
    console.error('Error fetching setters:', settersError)
    return
  }

  console.log(`Found ${closers?.length || 0} closers and ${setters?.length || 0} setters\n`)

  let created = 0
  let updated = 0
  let skipped = 0

  // Create closers
  if (closers) {
    console.log('📞 Creating closers...')
    for (const closer of closers) {
      const email = closer.email || `${closer.name.toLowerCase().replace(/\s+/g, '.')}@example.com`

      try {
        // Try to create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: GENERIC_PASSWORD,
          email_confirm: true
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`  ⏭️  ${closer.name} - Email already exists, updating records...`)

            // Get existing user
            const { data: existingUser } = await supabase.auth.admin.listUsers()
            const user = existingUser?.users.find(u => u.email === email)

            if (user) {
              // Update users table
              await supabase
                .from('users')
                .upsert({
                  id: user.id,
                  email,
                  name: closer.name,
                  role: 'closer'
                })

              // Update closer with email if missing
              await supabase
                .from('closers')
                .update({ email })
                .eq('id', closer.id)

              updated++
            }
          } else {
            console.error(`  ❌ Error creating ${closer.name}:`, authError.message)
            skipped++
          }
          continue
        }

        // Create users table record
        await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name: closer.name,
            role: 'closer'
          })

        // Update closer with email
        await supabase
          .from('closers')
          .update({ email })
          .eq('id', closer.id)

        console.log(`  ✅ ${closer.name} - ${email}`)
        created++
      } catch (error: any) {
        console.error(`  ❌ Error with ${closer.name}:`, error.message)
        skipped++
      }
    }
  }

  // Create setters
  if (setters) {
    console.log('\n📅 Creating setters...')
    for (const setter of setters) {
      const email = setter.email || `${setter.name.toLowerCase().replace(/\s+/g, '.')}@example.com`

      try {
        // Try to create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: GENERIC_PASSWORD,
          email_confirm: true
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`  ⏭️  ${setter.name} - Email already exists, updating records...`)

            // Get existing user
            const { data: existingUser } = await supabase.auth.admin.listUsers()
            const user = existingUser?.users.find(u => u.email === email)

            if (user) {
              // Update users table
              await supabase
                .from('users')
                .upsert({
                  id: user.id,
                  email,
                  name: setter.name,
                  role: 'setter'
                })

              // Update setter with email if missing
              await supabase
                .from('setters')
                .update({ email })
                .eq('id', setter.id)

              updated++
            }
          } else {
            console.error(`  ❌ Error creating ${setter.name}:`, authError.message)
            skipped++
          }
          continue
        }

        // Create users table record
        await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email,
            name: setter.name,
            role: 'setter'
          })

        // Update setter with email
        await supabase
          .from('setters')
          .update({ email })
          .eq('id', setter.id)

        console.log(`  ✅ ${setter.name} - ${email}`)
        created++
      } catch (error: any) {
        console.error(`  ❌ Error with ${setter.name}:`, error.message)
        skipped++
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  console.log(`  ✅ Created: ${created}`)
  console.log(`  🔄 Updated: ${updated}`)
  console.log(`  ⏭️  Skipped: ${skipped}`)
  console.log('\n🔑 Generic password for all users: ' + GENERIC_PASSWORD)
  console.log('='.repeat(60))
}

createAllUsers()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
