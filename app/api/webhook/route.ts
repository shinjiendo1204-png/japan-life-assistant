import Stripe from 'stripe'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  console.log('Webhook received')

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('Event type:', event.type)
  } catch (e: any) {
    console.error('Webhook error:', e.message)
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string
    const customerEmail = session.customer_details?.email!

    console.log('Customer email:', customerEmail)

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const priceId = subscription.items.data[0].price.id
    const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'standard'

    console.log('Plan:', plan)

    // メールアドレスでユーザーを検索（listUsersを使用）
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const user = users.find(u => u.email === customerEmail)

    if (user) {
      console.log('User found:', user.id)
      const { error } = await supabase
        .from('profiles')
        .update({
          plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        })
        .eq('id', user.id)

      if (error) {
        console.error('Supabase update error:', error)
      } else {
        console.log('Profile updated successfully')
      }
    } else {
      console.error('User not found for email:', customerEmail)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    await supabase
      .from('profiles')
      .update({ plan: 'free' })
      .eq('stripe_subscription_id', subscription.id)
    console.log('Subscription cancelled, plan reset to free')
  }

  return NextResponse.json({ received: true })
}