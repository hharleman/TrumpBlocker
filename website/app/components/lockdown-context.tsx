'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface LockdownContextType {
  isLocked: boolean
  setIsLocked: (locked: boolean) => void
  savedPin: string
  setSavedPin: (pin: string) => void
  verifyPin: () => Promise<boolean>
  blockingCategories: Record<string, boolean>
  setBlockingCategories: (categories: Record<string, boolean>) => void
  customKeywords: string
  setCustomKeywords: (keywords: string) => void
  customKeywordsEnabled: boolean
  setCustomKeywordsEnabled: (enabled: boolean) => void
}

const LockdownContext = createContext<LockdownContextType | undefined>(undefined)

export function LockdownProvider({ children }: { children: ReactNode }) {
  const [isLocked, setIsLocked] = useState(false)
  const [savedPin, setSavedPin] = useState('')
  const [blockingCategories, setBlockingCategories] = useState({
    trump: true,
    vance: true,
    rightwing: true,
    redpill: true,
    foxnews: true,
    redpillcontent: true
  })
  const [customKeywords, setCustomKeywords] = useState('')
  const [customKeywordsEnabled, setCustomKeywordsEnabled] = useState(false)

  // Load saved settings on mount
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        let savedSettings = null
        
        // Try to load from Chrome extension storage first
        if (typeof chrome !== 'undefined' && chrome.storage) {
          const result = await chrome.storage.sync.get(['trumpBlockerSettings'])
          savedSettings = result.trumpBlockerSettings
        } else {
          // Fallback to localStorage
          const saved = localStorage.getItem('trumpBlockerSettings')
          if (saved) {
            savedSettings = JSON.parse(saved)
          }
        }

        if (savedSettings) {
          // Restore lockdown settings
          if (savedSettings.lockdown) {
            setIsLocked(savedSettings.lockdown.isLocked || false)
            setSavedPin(savedSettings.lockdown.savedPin || '')
          }
          
          // Restore blocking categories
          if (savedSettings.blockingCategories) {
            setBlockingCategories(savedSettings.blockingCategories)
          }
          
          // Restore custom keywords
          if (savedSettings.customKeywords) {
            setCustomKeywordsEnabled(savedSettings.customKeywords.enabled || false)
            const keywords = Array.isArray(savedSettings.customKeywords.keywords) 
              ? savedSettings.customKeywords.keywords.join(', ') 
              : ''
            setCustomKeywords(keywords)
          }
        }
      } catch (error) {
        console.error('Error loading saved settings:', error)
      }
    }

    loadSavedSettings()
  }, [])

  const verifyPin = async (): Promise<boolean> => {
    if (!isLocked || !savedPin) return true
    
    return new Promise((resolve) => {
      const enteredPin = prompt('Enter your PIN to make changes:')
      resolve(enteredPin === savedPin)
    })
  }

  return (
    <LockdownContext.Provider value={{
      isLocked,
      setIsLocked,
      savedPin,
      setSavedPin,
      verifyPin,
      blockingCategories,
      setBlockingCategories,
      customKeywords,
      setCustomKeywords,
      customKeywordsEnabled,
      setCustomKeywordsEnabled
    }}>
      {children}
    </LockdownContext.Provider>
  )
}

export function useLockdown() {
  const context = useContext(LockdownContext)
  if (context === undefined) {
    throw new Error('useLockdown must be used within a LockdownProvider')
  }
  return context
}