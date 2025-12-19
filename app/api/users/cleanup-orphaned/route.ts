import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 30

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
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Get all auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Find the user with this email
    const authUser = authUsers.users.find(u => u.email === email)

    if (!authUser) {
      return NextResponse.json({ error: 'No auth user found with this email' }, { status: 404 })
    }

    // Check if user exists in users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', authUser.id)
      .single()

    if (userError && userError.code !== 'PGRST116') { // PGRST116 is "no rows found"
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    // If user exists in users table, nothing to clean up
    if (userData) {
      return NextResponse.json({
        message: 'User exists in both auth and users table, no cleanup needed',
        exists: true
      })
    }

    // Delete the orphaned auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Orphaned auth user deleted successfully',
      email
    })
  } catch (error: any) {
    console.error('Error in cleanup orphaned users API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
