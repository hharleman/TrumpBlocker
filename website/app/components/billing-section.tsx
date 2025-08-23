'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

interface BillingSectionProps {
  isPremium: boolean
}

export default function BillingSection({ isPremium }: BillingSectionProps) {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // Load Stripe.js script if not already loaded
    if (!document.querySelector('#stripe-js')) {
      const script = document.createElement('script')
      script.id = 'stripe-js'
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then(() => router.replace('/dashboard'))
        .catch(() => router.replace('/dashboard'))
    }
  }, [searchParams, router])

  const handleSubscribe = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' })
    const data = await res.json()
    if (data?.sessionId) {
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      stripe?.redirectToCheckout({ sessionId: data.sessionId })
    }
  }

  return (
    <div className="mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Billing & Payment</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <p className="text-green-600">You are subscribed to Premium.</p>
          ) : (
            <Button onClick={handleSubscribe}>Upgrade to Premium - $2/month</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
