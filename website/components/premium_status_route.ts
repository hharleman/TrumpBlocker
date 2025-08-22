// website/app/api/user/premium-status/route.ts
// This endpoint safely checks premium status without exposing API keys

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import Stripe from 'stripe'

// API keys are ONLY on your backend server - never in the extension
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(req: NextRequest) {
  try {
    // Verify user authentication through Clerk (your auth service)
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ isPremium: false, error: 'Not authenticated' })
    }

    // Use YOUR Stripe account to check subscription
    // Extension never sees these API keys
    const user = await getUserFromDatabase(userId) // Your user lookup
    
    if (!user?.stripeCustomerId) {
      return NextResponse.json({ isPremium: false })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      status: 'active',
      limit: 1,
    })

    const isPremium = subscriptions.data.length > 0

    return NextResponse.json({ 
      isPremium,
      features: isPremium ? ['custom_keywords', 'parental_controls'] : []
    })
  } catch (error) {
    console.error('Error checking premium status:', error)
    return NextResponse.json({ isPremium: false, error: 'Server error' })
  }
}

// Helper function - implement based on your database
async function getUserFromDatabase(userId: string) {
  // Your database lookup logic here
  // Return user data including stripeCustomerId
  return {
    id: userId,
    stripeCustomerId: 'cus_example123'
  }
}