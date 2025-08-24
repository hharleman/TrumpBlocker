'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/app/components/ui/switch'
import { Label } from '@/app/components/ui/label'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useLockdown } from './lockdown-context'

interface PinProtectedToggleProps {
  isPremium: boolean
}

export default function PinProtectedToggle({ isPremium }: PinProtectedToggleProps) {
  const { isLocked, setIsLocked, savedPin, setSavedPin } = useLockdown()
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)

  // Update the PIN input field when savedPin changes (from loaded settings)
  useEffect(() => {
    if (savedPin && !pin) {
      setPin(savedPin)
    }
  }, [savedPin, pin])

  const handleToggleChange = (checked: boolean) => {
    if (!isPremium) return
    
    if (!savedPin) {
      alert('Please set a PIN first before enabling lockdown.')
      return
    }

    if (checked) {
      const enteredPin = prompt('Enter your PIN to enable lockdown:')
      if (enteredPin === savedPin) {
        setIsLocked(true)
      } else {
        alert('Incorrect PIN!')
      }
    } else {
      const enteredPin = prompt('Enter your PIN to disable lockdown:')
      if (enteredPin === savedPin) {
        setIsLocked(false)
      } else {
        alert('Incorrect PIN!')
      }
    }
  }

  const handleSetPin = () => {
    if (!isPremium) return
    
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      alert('Please enter exactly 6 digits.')
      return
    }
    
    setSavedPin(pin)
    alert('PIN has been set successfully!')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="parental">Lockdown Content</Label>
        <Switch 
          id="parental" 
          disabled={!isPremium || !savedPin}
          checked={isLocked}
          onCheckedChange={handleToggleChange}
        />
      </div>
      
      {isPremium && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-sm font-medium">Set Your 6-Digit PIN</Label>
            <p className="text-xs text-gray-600 mt-1">
              This PIN is required any time you want to make changes to the content block or remove it on the extension or dashboard.
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                type={showPin ? 'text' : 'password'}
                placeholder="Enter 6 digits"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="pr-10"
                disabled={!isPremium}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPin(!showPin)}
                disabled={!isPremium}
              >
                {showPin ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            <Button 
              onClick={handleSetPin}
              disabled={!isPremium || pin.length !== 6}
              size="sm"
            >
              Set PIN
            </Button>
          </div>
          
          {savedPin && (
            <p className="text-sm text-green-600">✓ PIN has been set</p>
          )}
        </div>
      )}
    </div>
  )
}