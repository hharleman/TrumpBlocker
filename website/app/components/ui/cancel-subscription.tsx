'use client'

import { useState } from 'react'
import { Button } from './button'

export function CancelSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      })

      if (response.ok) {
        alert('Your subscription has been canceled. You will continue to have premium access until the end of your billing period.')
        window.location.reload()
      } else {
        alert('There was an error canceling your subscription. Please try again.')
      }
    } catch (error) {
      alert('There was an error canceling your subscription. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleCancel}
      disabled={isLoading}
      variant="outline" 
      className="w-full mt-4 border-red-300 text-red-600 hover:bg-red-50"
    >
      {isLoading ? 'Canceling...' : 'Cancel Subscription'}
    </Button>
  )
}