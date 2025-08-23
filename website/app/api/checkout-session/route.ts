import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser, clerkClient } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-04-10',
})

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('session_id')
  const user = await currentUser()

  if (!sessionId || !user) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId)

  if (session.payment_status === 'paid') {
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: { isPremium: true },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 400 })
}
