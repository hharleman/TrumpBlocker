import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { headers } from 'next/headers'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
})

export async function POST() {
  const user = await currentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const origin = headers().get('origin') || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID as string,
        quantity: 1,
      },
    ],
    success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard`,
    customer_email: user.emailAddresses[0]?.emailAddress,
  })

  return NextResponse.json({ sessionId: session.id })
}
