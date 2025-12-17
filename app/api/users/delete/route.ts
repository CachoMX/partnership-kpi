import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    // Get user info before deletion
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('email, role')
      .eq('id', userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Don't allow deleting admins
    if (userData.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 })
    }

    // Delete from closers/setters table if applicable (calls will cascade delete due to FK constraints)
    if (userData.role === 'closer') {
      await supabaseAdmin
        .from('closers')
        .delete()
        .eq('email', userData.email)
    } else if (userData.role === 'setter') {
      await supabaseAdmin
        .from('setters')
        .delete()
        .eq('email', userData.email)
    }

    // Delete from users table
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (usersError) {
      console.error('Error deleting from users table:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Delete auth user
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      // Continue anyway as the user record is already deleted
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in delete user API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
