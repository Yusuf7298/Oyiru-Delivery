'use client'

import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'

export function TelegramInitializer() {
  useEffect(() => {
    // Initialize Telegram Web App
    if (typeof window !== 'undefined') {
      WebApp.ready()
      WebApp.expand()
      
      // Set theme based on Telegram's theme
      const isDark = WebApp.colorScheme === 'dark'
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  return null
}
