import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { clerkClient } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')!

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription' && session.metadata?.userId) {
          // Set user as premium
          await clerkClient.users.updateUserMetadata(session.metadata.userId, {
            publicMetadata: {
              isPremium: true,
              stripeCustomerId: session.customer as string,
              subscriptionId: session.subscription as string,
              subscriptionDate: new Date().toISOString()
            }
          })
          
          console.log(`User ${session.metadata.userId} upgraded to premium`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find user by Stripe customer ID and remove premium status
        const users = await clerkClient.users.getUserList()
        const user = users.find(u => 
          u.publicMetadata?.stripeCustomerId === subscription.customer
        )
        
        if (user) {
          await clerkClient.users.updateUserMetadata(user.id, {
            publicMetadata: {
              isPremium: false,
              subscriptionCanceled: true,
              cancelationDate: new Date().toISOString()
            }
          })
          
          console.log(`User ${user.id} subscription canceled`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Optionally handle failed payments
        console.log(`Payment failed for customer ${invoice.customer}`)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' }, 
      { status: 500 }
    )
  }
}