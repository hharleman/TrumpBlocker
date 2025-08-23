import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// Endpoint to simulate a successful payment for testing
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simulate successful payment - update user to premium
    await clerkClient.users.updateUserMetadata(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        isPremium: true,
        stripeCustomerId: 'test_customer_' + Date.now(),
        subscriptionId: 'test_sub_' + Date.now(),
        subscriptionDate: new Date().toISOString(),
        paymentSimulated: true,
        testMode: true
      }
    })

    console.log(`User ${user.id} upgraded to premium via simulated payment`)

    return NextResponse.json({ 
      success: true, 
      message: 'Premium activated via simulation!',
      sessionId: 'test_session_' + Date.now()
    })
  } catch (error) {
    console.error('Error simulating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}