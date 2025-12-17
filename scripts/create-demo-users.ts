import * as path from 'path'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../lib/database.types'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createDemoUsers() {
  console.log('Creating demo users...')

  const demoUsers = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin' as const
    },
    {
      email: 'closer@example.com',
      password: 'closer123',
      name: 'Demo Closer',
      role: 'closer' as const
    },
    {
      email: 'setter@example.com',
      password: 'setter123',
      name: 'Demo Setter',
      role: 'setter' as const
    }
  ]

  for (const user of demoUsers) {
    console.log(`Creating ${user.role}: ${user.email}`)

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      })

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message)
        continue
      }

      // Create user record in users table
      const { error: userError } = await supabase
        .from('users')
        .upsert({
          email: user.email,
          name: user.name,
          role: user.role
        }, { onConflict: 'email' })

      if (userError) {
        console.error(`Error creating user record ${user.email}:`, userError.message)
        continue
      }

      // If closer, create/update closer record
      if (user.role === 'closer') {
        const { error: closerError } = await supabase
          .from('closers')
          .upsert({
            name: user.name,
            email: user.email
          }, { onConflict: 'email' })

        if (closerError) {
          console.error(`Error creating closer record:`, closerError.message)
        }
      }
      // If setter, create/update setter record
      else if (user.role === 'setter') {
        const { error: setterError } = await supabase
          .from('setters')
          .upsert({
            name: user.name,
            email: user.email
          }, { onConflict: 'email' })

        if (setterError) {
          console.error(`Error creating setter record:`, setterError.message)
        }
      }

      console.log(`✅ Created ${user.role}: ${user.email}`)
    } catch (error) {
      console.error(`Fatal error creating user ${user.email}:`, error)
    }
  }

  console.log('\n✅ Demo users created successfully!')
  console.log('\nLogin credentials:')
  console.log('Admin: admin@example.com / admin123')
  console.log('Closer: closer@example.com / closer123')
  console.log('Setter: setter@example.com / setter123')
}

createDemoUsers()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
