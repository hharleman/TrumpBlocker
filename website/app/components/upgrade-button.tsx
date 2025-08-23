'use client'

// Button that launches the Stripe checkout flow
// used by the "Upgrade to Premium" card on the dashboard
import { useEffect } from 'react'
import { Button } from '@/app/components/ui/button'

export default function UpgradeButton() {
  // Ensure the Stripe.js script is loaded
  useEffect(() => {
    if (!document.querySelector('#stripe-js')) {
      const script = document.createElement('script')
      script.id = 'stripe-js'
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  // Create a checkout session and redirect the user
  const handleSubscribe = async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' })
    const data = await res.json()
    if (data?.sessionId) {
      const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      stripe?.redirectToCheckout({ sessionId: data.sessionId })
    }
  }

  return (
    <Button onClick={handleSubscribe} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">
      Upgrade Now - $2/month
    </Button>
  )
}
