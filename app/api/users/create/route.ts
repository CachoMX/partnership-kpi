import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 10

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create auth user with admin client
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })

    if (authError) {
      console.error('Error creating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Create user record in users table
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name,
        role
      })

    if (userError) {
      console.error('Error creating user record:', userError)
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // If closer, create closer record
    if (role === 'closer') {
      const { error: closerError } = await supabaseAdmin
        .from('closers')
        .insert({ name, email })

      if (closerError) {
        console.error('Error creating closer record:', closerError)
      }
    }

    // If setter, create setter record
    if (role === 'setter') {
      const { error: setterError } = await supabaseAdmin
        .from('setters')
        .insert({ name, email })

      if (setterError) {
        console.error('Error creating setter record:', setterError)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email,
        name,
        role
      }
    })
  } catch (error: any) {
    console.error('Error in create user API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
