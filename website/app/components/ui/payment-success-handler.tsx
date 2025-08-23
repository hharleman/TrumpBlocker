'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export function PaymentSuccessHandler() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId && !isProcessing) {
      verifyPayment(sessionId)
    }
  }, [searchParams, isProcessing])

  const verifyPayment = async (sessionId: string) => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowSuccess(true)
        
        // Remove the session_id from URL without page reload
        const url = new URL(window.location.href)
        url.searchParams.delete('session_id')
        window.history.replaceState({}, '', url.pathname)
        
        // Refresh the page after a short delay to show updated premium status
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      }
    } catch (error) {
      console.error('Error verifying payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg z-50">
        <div className="flex items-center">
          <span className="mr-2">🎉</span>
          <div>
            <strong>Payment Successful!</strong>
            <br />
            <span className="text-sm">Your premium features are now active.</span>
          </div>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded shadow-lg z-50">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
          <span>Activating premium features...</span>
        </div>
      </div>
    )
  }

  return null
}