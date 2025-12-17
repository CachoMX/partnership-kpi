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
    const { userId, name, email, role } = await request.json()

    if (!userId || !name || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update auth user email if changed
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email }
    )

    if (authError) {
      console.error('Error updating auth user:', authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    // Update users table
    const { error: usersError } = await supabaseAdmin
      .from('users')
      .update({ name, email, role })
      .eq('id', userId)

    if (usersError) {
      console.error('Error updating users table:', usersError)
      return NextResponse.json({ error: usersError.message }, { status: 500 })
    }

    // Get closer_id or setter_id from users table
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    // Update closers/setters table if applicable
    if (role === 'closer' && userData) {
      const { data: closerData } = await supabaseAdmin
        .from('closers')
        .select('id')
        .eq('email', email)
        .single()

      if (closerData) {
        await supabaseAdmin
          .from('closers')
          .update({ name, email })
          .eq('id', closerData.id)
      }
    } else if (role === 'setter' && userData) {
      const { data: setterData } = await supabaseAdmin
        .from('setters')
        .select('id')
        .eq('email', email)
        .single()

      if (setterData) {
        await supabaseAdmin
          .from('setters')
          .update({ name, email })
          .eq('id', setterData.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in update user API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
