// website/app/api/extension/settings/route.ts
// Securely sync extension settings

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function GET() {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user settings from YOUR database (not from extension storage)
    const userSettings = await getUserSettingsFromDatabase(userId)
    
    return NextResponse.json(userSettings)
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await req.json()
    
    // Save to YOUR database - validate premium features
    const user = await getUserFromDatabase(userId)
    const isPremium = await checkUserPremiumStatus(user)
    
    // Only allow custom keywords if user is premium
    if (settings.customKeywords && !isPremium) {
      return NextResponse.json({ error: 'Premium required for custom keywords' }, { status: 403 })
    }

    await saveUserSettingsToDatabase(userId, settings)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

async function getUserSettingsFromDatabase(userId: string) {
  // Your database logic
  return {
    categories: { trump: true, vance: true, rightwing: true, redpill: true, foxnews: true, redpillcontent: true },
    customKeywords: '',
    isPremium: false
  }
}

async function getUserFromDatabase(userId: string) {
  // Your database lookup logic here
  return {
    id: userId,
    stripeCustomerId: 'cus_example123'
  }
}

async function checkUserPremiumStatus(user: any) {
  // Check with Stripe using YOUR API keys
  return false // placeholder
}

async function saveUserSettingsToDatabase(userId: string, settings: any) {
  // Your database save logic
}