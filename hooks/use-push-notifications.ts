'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from './use-auth'

const BEAMS_INSTANCE_ID = '4363638b-37cc-4fdb-99bb-9b20c8d4865a'

export function usePushNotifications() {
  const { isAuthenticated, user } = useAuth()
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated || initialized.current) return
    if (typeof window === 'undefined') return

    // Load Pusher Beams SDK dynamically
    const script = document.createElement('script')
    script.src = 'https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js'
    script.async = true
    script.onload = async () => {
      try {
        const PusherPushNotifications = (window as any).PusherPushNotifications
        if (!PusherPushNotifications) return

        const beamsClient = new PusherPushNotifications.Client({
          instanceId: BEAMS_INSTANCE_ID,
        })

        await beamsClient.start()

        // Subscribe to general interests
        await beamsClient.addDeviceInterest('hello')

        // Subscribe to user-specific interest
        if (user?.id) {
          await beamsClient.addDeviceInterest(`user-${user.id}`)
        }

        initialized.current = true
        console.log('✅ Push notifications registered')
      } catch (err) {
        console.warn('Push notifications not available:', err)
      }
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
    }
  }, [isAuthenticated, user?.id])
}
