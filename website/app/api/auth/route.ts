// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

export async function GET() {
  try {
    const { userId, getToken } = auth()
    
    if (!userId) {
      return NextResponse.json({ authenticated: false })
    }

    // Generate a temporary session token for the extension
    const token = await getToken({ template: 'integration_chrome_extension' })

    return NextResponse.json({ 
      authenticated: true,
      token,
      userId
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false })
  }
}