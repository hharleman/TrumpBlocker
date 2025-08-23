'use client'

import { useState } from 'react'
import { Button } from './button'

export function TestPremiumButton() {
  const [loading, setLoading] = useState(false)

  const activatePremium = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-premium', {
        method: 'POST',
      })
      
      if (response.ok) {
        alert('Premium activated! Refresh the page to see changes.')
        window.location.reload()
      } else {
        alert('Failed to activate premium')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error activating premium')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={activatePremium}
      disabled={loading}
      variant="outline"
      className="text-sm"
    >
      {loading ? 'Activating...' : 'Test Premium Activation'}
    </Button>
  )
}