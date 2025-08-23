import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

export async function POST() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // In a real implementation, you would:
    // 1. Get the user's Stripe customer ID from their metadata
    // 2. Cancel their subscription in Stripe
    // 3. Set up the subscription to cancel at the end of the billing period
    
    // For now, we'll just update the user's metadata to mark cancellation
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        isPremium: true, // Keep premium until end of billing period
        subscriptionCanceled: true,
        cancelationDate: new Date().toISOString()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be canceled at the end of your billing period'
    })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}