'use client'

import { useState } from 'react'
import { Button } from '@/app/components/ui/button'
import { Save, Check } from 'lucide-react'
import { useLockdown } from './lockdown-context'

export default function SaveSettingsButton() {
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { 
    isLocked, 
    savedPin, 
    blockingCategories, 
    customKeywords, 
    customKeywordsEnabled 
  } = useLockdown()

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      // Collect all settings from the centralized state
      const settings = {
        lockdown: {
          isLocked,
          savedPin
        },
        blockingCategories,
        customKeywords: {
          enabled: customKeywordsEnabled,
          keywords: customKeywords.split(',').filter(k => k.trim().length > 0)
        }
      }

      // Save to Chrome extension storage if available, or localStorage as fallback
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ trumpBlockerSettings: settings })
      } else {
        localStorage.setItem('trumpBlockerSettings', JSON.stringify(settings))
      }
      
      console.log('Settings saved successfully:', settings)
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000) // Show success message for 3 seconds
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Button 
      onClick={handleSave}
      disabled={isSaving}
      className="w-full bg-red-600 hover:bg-red-700 text-white"
    >
      {isSaved ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          Settings Saved!
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Settings'}
        </>
      )}
    </Button>
  )
}