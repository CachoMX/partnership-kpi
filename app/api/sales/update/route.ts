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
    const {
      callId,
      closerId,
      closerName,
      setterId,
      setterName,
      sales_platform,
      payment_method,
      commission_override,
      commission_rate_override
    } = await request.json()

    if (!callId) {
      return NextResponse.json({ error: 'Missing callId' }, { status: 400 })
    }

    const updateData: any = {}

    // Update closer if provided
    if (closerId !== undefined) {
      updateData.closer_id = closerId || null
      updateData.closer_name = closerName || ''
    }

    // Update setter if provided
    if (setterId !== undefined) {
      updateData.setter_id = setterId || null
      updateData.setter_name = setterName || null
    }

    // Update sales platform if provided
    if (sales_platform !== undefined) {
      updateData.sales_platform = sales_platform || null
    }

    // Update payment method if provided
    if (payment_method !== undefined) {
      updateData.payment_method = payment_method || null
    }

    // Update commission override if provided
    if (commission_override !== undefined) {
      updateData.commission_override = commission_override || null
    }

    // Update commission rate override if provided
    if (commission_rate_override !== undefined) {
      updateData.commission_rate_override = commission_rate_override || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('calls')
      .update(updateData)
      .eq('id', callId)

    if (error) {
      console.error('Error updating call:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in sales update API:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
