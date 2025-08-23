import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const user = await currentUser()
  const isPremium = user?.publicMetadata?.isPremium === true
  return NextResponse.json({ isPremium })
}
