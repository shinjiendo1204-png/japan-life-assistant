import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)
    console.log('STRIPE_SECRET_KEY starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 10))
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log('STRIPE_PRO_PRICE_ID:', process.env.STRIPE_PRO_PRICE_ID)

    const { sessionId, userId } = await req.json()
    console.log('Session ID:', sessionId)
    console.log('User ID:', userId)

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe key missing' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    console.log('Session status:', session.payment_status)
    console.log('Session metadata:', session.metadata)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const userIdFromMeta = session.metadata?.user_id || userId

    if (!userIdFromMeta) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 })
    }

    const subscription = session.subscription as Stripe.Subscription
    const priceId = subscription.items.data[0].price.id
    const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'standard'

    console.log('Plan to set:', plan)
    console.log('User ID to update:', userIdFromMeta)

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        plan,
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: subscription.id,
      })
      .eq('id', userIdFromMeta)
      .select()

    console.log('Update data:', JSON.stringify(data))
    console.log('Update error:', JSON.stringify(error))
    console.log('Rows affected:', data?.length)

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      console.log('No rows updated, trying insert...')

      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userIdFromMeta,
          plan,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          usage_count: 0,
          usage_reset_at: new Date().toISOString(),
        })
        .select()

      console.log('Insert data:', JSON.stringify(insertData))
      console.log('Insert error:', JSON.stringify(insertError))

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }
    }

    console.log('Profile updated successfully for user:', userIdFromMeta)
    return NextResponse.json({ success: true, plan })

  } catch (e: any) {
    console.error('Full error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}