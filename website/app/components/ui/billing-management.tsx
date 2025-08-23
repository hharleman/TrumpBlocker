'use client'

import { useState } from 'react'
import { Button } from './button'
import { Switch } from './switch'
import { Label } from './label'
import { CreditCard, ExternalLink, Loader2 } from 'lucide-react'

interface BillingManagementProps {
  isPremium: boolean
  isYellowTheme?: boolean
}

export function BillingManagement({ isPremium, isYellowTheme = false }: BillingManagementProps) {
  const [loading, setLoading] = useState(false)
  const [isAnnual, setIsAnnual] = useState(false)

  const handleManageBilling = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log('Portal session response:', { status: response.status, data })

      if (response.ok && data.url) {
        window.open(data.url, '_blank')
      } else {
        console.error('Error creating portal session:', data.error)
        alert(`Unable to access billing portal: ${data.error || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Unable to access billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpgrade = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isAnnual: isAnnual
        }),
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        console.error('Error creating checkout session:', data.error)
        alert('Unable to start checkout. Please try again.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Unable to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isPremium) {
    const monthlyPrice = isAnnual ? "$20/year" : "$2/month"
    const savings = isAnnual ? " (Save $4/year!)" : ""
    
    return (
      <div className="space-y-4">
        {isYellowTheme && (
          <div className="flex items-center justify-center gap-3 p-2 bg-white/20 rounded-lg">
            <Label htmlFor="billing-toggle" className="text-sm font-medium text-yellow-800">
              Monthly
            </Label>
            <Switch 
              id="billing-toggle" 
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
            />
            <Label htmlFor="billing-toggle" className="text-sm font-medium text-yellow-800">
              Annual
            </Label>
            {isAnnual && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                Save $4!
              </span>
            )}
          </div>
        )}
        <Button 
          onClick={handleUpgrade}
          disabled={loading}
          className={`w-full text-white ${
            isYellowTheme 
              ? "bg-yellow-600 hover:bg-yellow-700" 
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isYellowTheme 
            ? `Upgrade Now - ${monthlyPrice}${savings}` 
            : "Subscribe"
          }
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <CreditCard className="h-5 w-5 text-green-600" />
        <div>
          <p className="font-medium text-gray-900">Billing & Subscription</p>
          <p className="text-sm text-gray-500">Manage your premium subscription</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        onClick={handleManageBilling}
        disabled={loading}
        className="text-gray-700 border-gray-300 hover:bg-gray-50"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        Manage Billing
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>
    </div>
  )
}