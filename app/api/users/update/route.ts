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
    const { userId, name, email: rawEmail, role, password } = await request.json()

    if (!userId || !name || !rawEmail || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize email to lowercase to prevent case sensitivity issues
    const email = rawEmail.toLowerCase().trim()

    // Get current user data BEFORE updating (to get the old email for closers/setters lookup)
    const { data: currentUserData, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('email, role')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching current user:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const oldEmail = currentUserData?.email
    const oldRole = currentUserData?.role

    // Prepare auth update payload
    const authUpdatePayload: any = { email }

    // Only update password if provided
    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      authUpdatePayload.password = password
    }

    // Update auth user email and password if changed
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      authUpdatePayload
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

    // Update closers/setters table if applicable (use OLD email to find the record, case-insensitive)
    if (oldRole === 'closer') {
      const { data: closerData } = await supabaseAdmin
        .from('closers')
        .select('id')
        .ilike('email', oldEmail)
        .maybeSingle()

      if (closerData) {
        await supabaseAdmin
          .from('closers')
          .update({ name, email })
          .eq('id', closerData.id)
      }
    } else if (oldRole === 'setter') {
      const { data: setterData } = await supabaseAdmin
        .from('setters')
        .select('id')
        .ilike('email', oldEmail)
        .maybeSingle()

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
