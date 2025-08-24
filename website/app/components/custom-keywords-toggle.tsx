'use client'

import { useState } from 'react'
import { Switch } from '@/app/components/ui/switch'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { useLockdown } from './lockdown-context'

interface CustomKeywordsToggleProps {
  isPremium: boolean
}

export default function CustomKeywordsToggle({ isPremium }: CustomKeywordsToggleProps) {
  const { 
    verifyPin, 
    customKeywords, 
    setCustomKeywords, 
    customKeywordsEnabled, 
    setCustomKeywordsEnabled 
  } = useLockdown()

  const handleToggleChange = async (checked: boolean) => {
    if (!isPremium) return
    
    const canChange = await verifyPin()
    if (canChange) {
      setCustomKeywordsEnabled(checked)
    }
  }

  const handleKeywordsChange = (value: string) => {
    if (!isPremium) return
    // No PIN required for typing keywords - only for toggles
    setCustomKeywords(value)
  }

  const keywordCount = customKeywords.split(',').filter(k => k.trim().length > 0).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="customkeywords">Enable Custom Keywords</Label>
        <Switch 
          id="customkeywords" 
          disabled={!isPremium}
          checked={customKeywordsEnabled && isPremium}
          onCheckedChange={handleToggleChange}
        />
      </div>
      <Textarea
        placeholder="Enter custom keywords separated by commas..."
        disabled={!isPremium || !customKeywordsEnabled}
        className="min-h-[100px]"
        value={customKeywords}
        onChange={(e) => handleKeywordsChange(e.target.value)}
      />
      <p className="text-sm text-gray-500">{keywordCount}/100 keywords</p>
    </div>
  )
}