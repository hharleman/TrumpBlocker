'use client'

// Section shown beneath Parental Controls for managing billing
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'

interface BillingSectionProps {
  isPremium: boolean
}

export default function BillingSection({ isPremium }: BillingSectionProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Holds subscription data returned from Stripe
  const [details, setDetails] = useState<any>(null)

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
    // After returning from Stripe checkout, finalize subscription
    const sessionId = searchParams.get('session_id')
    if (sessionId) {
      fetch(`/api/checkout-session?session_id=${sessionId}`)
        .then(() => router.replace('/dashboard'))
        .catch(() => router.replace('/dashboard'))
    }
  }, [searchParams, router])

  useEffect(() => {
    // Fetch billing details once the user is premium
    if (isPremium) {
      fetch('/api/billing-details')
        .then((res) => res.json())
        .then(setDetails)
        .catch(() => setDetails(null))
    }
  }, [isPremium])

  const handleSubscribe = async () => {
    // Start a new Stripe checkout session
    const res = await fetch('/api/create-checkout-session', { method: 'POST' })
    const data = await res.json()
    if (data?.sessionId) {
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      stripe?.redirectToCheckout({ sessionId: data.sessionId })
    }
  }

  const handleManage = async () => {
    // Redirect to Stripe's customer portal for card changes/cancellation
    const res = await fetch('/api/create-portal-session', { method: 'POST' })
    const data = await res.json()
    if (data?.url) {
      window.location.href = data.url
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Billing & Payment</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isPremium ? (
            <>
              <p className="text-green-600">Plan: {details?.tier || 'Premium'}</p>
              {details?.renewalDate && (
                <p>Renews on {new Date(details.renewalDate).toLocaleDateString()}</p>
              )}
              {details?.card && (
                <p>
                  Card: {details.card.brand?.toUpperCase()} ****{details.card.last4}
                </p>
              )}
              <Button variant="secondary" onClick={handleManage}>
                Manage Billing
              </Button>
            </>
          ) : (
            <Button onClick={handleSubscribe}>Upgrade to Premium - $2/month</Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
