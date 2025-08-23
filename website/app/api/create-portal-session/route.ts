import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      console.log('No user found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userEmail = user.emailAddresses[0]?.emailAddress
    console.log('User email:', userEmail)

    // Find the customer in Stripe by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    console.log('Found customers:', customers.data.length)

    if (customers.data.length === 0) {
      console.log('No customer found for email:', userEmail)
      return NextResponse.json({ error: 'Customer not found. You need to make a purchase first to access the billing portal.' }, { status: 404 })
    }

    const customer = customers.data[0]
    console.log('Customer ID:', customer.id)

    // Create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    console.log('Portal session created:', portalSession.url)
    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json(
      { error: `Error creating portal session: ${error.message}` },
      { status: 500 }
    )
  }
}