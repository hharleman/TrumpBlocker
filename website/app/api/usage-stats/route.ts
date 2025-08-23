import { NextResponse } from 'next/server'

// Placeholder endpoint that would normally return real usage stats
export async function GET() {
  // TODO: replace with database-backed statistics
  return NextResponse.json({
    today: 47,
    week: 312,
    topCategory: 'Trump Content',
  })
}
