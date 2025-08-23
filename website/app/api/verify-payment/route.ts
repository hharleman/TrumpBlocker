import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await req.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (session.payment_status === 'paid' && session.mode === 'subscription') {
      // Update user to premium
      await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: {
          ...user.publicMetadata,
          isPremium: true,
          stripeCustomerId: session.customer as string,
          subscriptionId: session.subscription as string,
          subscriptionDate: new Date().toISOString(),
          paymentVerified: true
        }
      })

      console.log(`User ${user.id} upgraded to premium via payment verification`)
      
      return NextResponse.json({ 
        success: true, 
        message: 'Premium status activated!' 
      })
    } else {
      return NextResponse.json({ 
        error: 'Payment not completed or invalid session' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}