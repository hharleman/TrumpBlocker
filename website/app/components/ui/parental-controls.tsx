'use client'

import { useState, useEffect } from 'react'
import { Switch } from './switch'
import { Label } from './label'
import { Input } from './input'
import { Button } from './button'
import { Badge } from './badge'
import { Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'

interface ParentalControlsProps {
  isPremium: boolean
}

export function ParentalControls({ isPremium }: ParentalControlsProps) {
  const [isLockdownEnabled, setIsLockdownEnabled] = useState(false)
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Load existing settings
  useEffect(() => {
    if (isPremium) {
      loadParentalSettings()
    }
  }, [isPremium])

  const loadParentalSettings = async () => {
    try {
      const response = await fetch('/api/parental-controls')
      if (response.ok) {
        const data = await response.json()
        setIsLockdownEnabled(data.isEnabled || false)
        // Don't load the actual PIN for security
      }
    } catch (error) {
      console.error('Failed to load parental settings:', error)
    }
  }

  const handleToggleChange = async (checked: boolean) => {
    if (checked && (!pin || pin.length !== 6)) {
      alert('Please set a 6-digit PIN first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/parental-controls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          isEnabled: checked,
          pin: checked ? pin : null
        })
      })

      if (response.ok) {
        setIsLockdownEnabled(checked)
        if (checked) {
          alert('PIN protection enabled successfully!')
        } else {
          setPin('')
          alert('PIN protection disabled')
        }
      } else {
        alert('Failed to update parental controls')
      }
    } catch (error) {
      alert('Failed to update parental controls')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (value: string) => {
    // Only allow digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setPin(numericValue)
  }

  return (
    <Card className={isPremium ? "" : "opacity-50"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Parental Controls
          {!isPremium && <Badge variant="secondary">Premium</Badge>}
        </CardTitle>
        <CardDescription>
          Require 6-digit PIN to modify extension settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="parental">Lockdown Changes</Label>
          <Switch 
            id="parental" 
            disabled={!isPremium || isLoading}
            checked={isLockdownEnabled}
            onCheckedChange={handleToggleChange}
          />
        </div>
        <div className="space-y-3">
          <div>
            <Label htmlFor="parentalPin">Set 6-Digit PIN</Label>
            <Input 
              id="parentalPin"
              type="password"
              placeholder="Enter 6-digit PIN"
              value={pin}
              onChange={(e) => handlePinChange(e.target.value)}
              disabled={!isPremium || isLoading}
              className="w-32 font-mono text-center"
            />
            {pin && pin.length < 6 && (
              <p className="text-sm text-red-500 mt-1">PIN must be exactly 6 digits</p>
            )}
          </div>
          <p className="text-sm text-gray-500">
            When enabled, changes to extension settings will require this 6-digit PIN
          </p>
        </div>
      </CardContent>
    </Card>
  )
}