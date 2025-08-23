import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-04-10' })

// Create a Stripe billing portal session so users can change card or cancel
export async function POST() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const email = user.emailAddresses[0]?.emailAddress
  const customers = await stripe.customers.list({ email, limit: 1 })
  const customer = customers.data[0]
  if (!customer) {
    return NextResponse.json({ error: 'No customer' }, { status: 400 })
  }

  const origin = headers().get('origin') || 'http://localhost:3000'
  const session = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: `${origin}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
