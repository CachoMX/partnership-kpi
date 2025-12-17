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

async function fixUsers() {
  console.log('Fixing users table...')

  const usersToInsert = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin' as const
    },
    {
      email: 'closer@example.com',
      name: 'Demo Closer',
      role: 'closer' as const
    },
    {
      email: 'setter@example.com',
      name: 'Demo Setter',
      role: 'setter' as const
    }
  ]

  for (const user of usersToInsert) {
    console.log(`Upserting user: ${user.email}`)

    const { error } = await supabase
      .from('users')
      .upsert({
        email: user.email,
        name: user.name,
        role: user.role
      }, { onConflict: 'email' })

    if (error) {
      console.error(`Error upserting ${user.email}:`, error.message)
    } else {
      console.log(`✅ Upserted ${user.email}`)
    }

    // Also ensure closer/setter records exist
    if (user.role === 'closer') {
      const { error: closerError } = await supabase
        .from('closers')
        .upsert({
          name: user.name,
          email: user.email
        }, { onConflict: 'email' })

      if (closerError) {
        console.error(`Error upserting closer:`, closerError.message)
      }
    } else if (user.role === 'setter') {
      const { error: setterError } = await supabase
        .from('setters')
        .upsert({
          name: user.name,
          email: user.email
        }, { onConflict: 'email' })

      if (setterError) {
        console.error(`Error upserting setter:`, setterError.message)
      }
    }
  }

  console.log('\n✅ Users table fixed!')
}

fixUsers()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
