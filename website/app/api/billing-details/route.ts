import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-04-10' })

// Return basic subscription info for the logged-in user
export async function GET() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = user.emailAddresses[0]?.emailAddress
  if (!email) {
    return NextResponse.json({ tier: 'Free' })
  }

  // Look up the Stripe customer by email
  const customers = await stripe.customers.list({ email, limit: 1 })
  const customer = customers.data[0]
  if (!customer) {
    return NextResponse.json({ tier: 'Free' })
  }

  // Fetch the active subscription
  const subs = await stripe.subscriptions.list({ customer: customer.id, limit: 1 })
  const sub = subs.data[0]
  if (!sub) {
    return NextResponse.json({ tier: 'Free' })
  }

  // Pull basic card details
  let card
  if (sub.default_payment_method) {
    const pm = await stripe.paymentMethods.retrieve(sub.default_payment_method as string)
    if (pm.card) {
      card = { brand: pm.card.brand, last4: pm.card.last4 }
    }
  }

  return NextResponse.json({
    tier: 'Premium',
    renewalDate: new Date(sub.current_period_end * 1000).toISOString(),
    card,
  })
}
