'use client'

/**
 * useRealtimeNotifications
 * ─────────────────────────────────────────────────────────────────────────────
 * Hook trung tâm quản lý toàn bộ thông báo realtime cho frontend (user).
 *
 * Chiến lược:
 *  - Desktop  : polling HTTP mỗi POLL_INTERVAL ms (mặc định 15s)
 *  - Mobile   : Page Visibility API → poll ngay khi tab active trở lại
 *               + giảm tần suất poll khi tab ẩn (tiết kiệm pin/data)
 *  - Offline  : navigator.onLine → dừng poll, resume khi online lại
 *  - Browser Notification API : hiện popup hệ thống khi có thông báo mới
 *  - Toast    : callback onNewNotification để component hiển thị toast
 *
 * Xem thêm: docs/REALTIME_NOTIFICATIONS.md
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_ACTIVE  = 15_000  // 15s khi tab đang active
const POLL_INTERVAL_HIDDEN  = 60_000  // 60s khi tab ẩn (mobile background)
const POLL_INTERVAL_OFFLINE = 0       // dừng khi offline

// ─── Types ────────────────────────────────────────────────────────────────────
export interface UserNotification {
  id: number
  title: string
  message: string
  type: 'order' | 'product' | 'review' | 'system' | 'info'
  is_read: boolean
  link?: string
  created_at: string
}

export interface BroadcastNotification {
  id: number
  title: string
  message: string
  type: 'info' | 'system' | 'promo' | 'order' | 'product'
  link?: string
  color?: string
  created_at: string
}

export interface NotificationPrefs {
  /** Bật/tắt toàn bộ thông báo */
  enabled: boolean
  /** Hiện toast popup trong app */
  showToast: boolean
  /** Hiện browser notification (popup hệ thống) */
  showBrowser: boolean
  /** Phát âm thanh khi có thông báo mới */
  playSound: boolean
  /** Các loại thông báo được bật */
  enabledTypes: Set<string>
}

export interface RealtimeNotificationState {
  userNotifs: UserNotification[]
  broadcastNotifs: BroadcastNotification[]
  totalUnread: number
  isLoading: boolean
  isOnline: boolean
  lastUpdated: Date | null
  prefs: NotificationPrefs
  /** Đánh dấu 1 user notification đã đọc */
  markUserRead: (id: number) => Promise<void>
  /** Đánh dấu tất cả đã đọc */
  markAllRead: () => Promise<void>
  /** Đánh dấu broadcast đã seen (client-side) */
  markBroadcastSeen: (id: number) => void
  /** Cập nhật preferences */
  updatePrefs: (prefs: Partial<NotificationPrefs>) => void
  /** Force refresh ngay lập tức */
  refresh: () => void
}

// ─── Default preferences ─────────────────────────────────────────────────────
const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  showToast: true,
  showBrowser: true,
  playSound: false,
  enabledTypes: new Set(['order', 'product', 'review', 'system', 'info', 'promo']),
}

const PREFS_STORAGE_KEY = 'notif_prefs_v1'

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_PREFS
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY)
    if (!raw) return DEFAULT_PREFS
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_PREFS,
      ...parsed,
      enabledTypes: new Set(parsed.enabledTypes ?? Array.from(DEFAULT_PREFS.enabledTypes)),
    }
  } catch {
    return DEFAULT_PREFS
  }
}

function savePrefs(prefs: NotificationPrefs) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify({
      ...prefs,
      enabledTypes: Array.from(prefs.enabledTypes),
    }))
  } catch { /* ignore */ }
}

// ─── Audio helper ─────────────────────────────────────────────────────────────
function playNotificationSound() {
  try {
    // Tạo âm thanh đơn giản bằng Web Audio API (không cần file)
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1)
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.3)
  } catch { /* ignore - browser may block */ }
}

// ─── Main Hook ────────────────────────────────────────────────────────────────
export function useRealtimeNotifications(options: {
  isAuthenticated: boolean
  userId?: number
  onNewNotification?: (notif: { title: string; message: string; type: string; link?: string }) => void
}): RealtimeNotificationState {
  const { isAuthenticated, onNewNotification } = options

  const [userNotifs, setUserNotifs]         = useState<UserNotification[]>([])
  const [broadcastNotifs, setBroadcastNotifs] = useState<BroadcastNotification[]>([])
  const [isLoading, setIsLoading]           = useState(false)
  const [isOnline, setIsOnline]             = useState(true)
  const [lastUpdated, setLastUpdated]       = useState<Date | null>(null)
  const [prefs, setPrefs]                   = useState<NotificationPrefs>(DEFAULT_PREFS)

  const pollRef              = useRef<ReturnType<typeof setInterval> | null>(null)
  const latestBroadcastId    = useRef(0)
  const prevUserUnread       = useRef(0)
  const seenBroadcastIds     = useRef<Set<number>>(new Set())
  const isTabVisible         = useRef(true)
  const isMounted            = useRef(true)

  // ── Load preferences từ localStorage ──────────────────────────────────────
  useEffect(() => {
    setPrefs(loadPrefs())
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  // ── Computed values ────────────────────────────────────────────────────────
  const userUnread      = userNotifs.filter(n => !n.is_read).length
  const broadcastUnseen = broadcastNotifs.filter(n => !seenBroadcastIds.current.has(n.id)).length
  const totalUnread     = userUnread + broadcastUnseen

  // ── Trigger new notification ───────────────────────────────────────────────
  const triggerNew = useCallback((item: { title: string; message: string; type: string; link?: string }) => {
    if (!prefs.enabled) return
    if (!prefs.enabledTypes.has(item.type)) return

    // Toast callback
    if (prefs.showToast) {
      onNewNotification?.(item)
    }

    // Browser notification
    if (prefs.showBrowser && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(item.title, {
          body: item.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: `notif-${Date.now()}`,
          // vibrate chỉ hoạt động trên mobile Chrome
          ...(item.link && { data: { url: item.link } }),
        })
        n.onclick = () => {
          window.focus()
          if (item.link) window.location.href = item.link
          n.close()
        }
      } catch { /* ignore */ }
    }

    // Sound
    if (prefs.playSound) {
      playNotificationSound()
    }

    // Mobile vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }, [prefs, onNewNotification])

  // ── Fetch user notifications ───────────────────────────────────────────────
  const fetchUserNotifs = useCallback(async (silent = false) => {
    if (!isAuthenticated || !isOnline) return
    if (!silent) setIsLoading(true)
    try {
      const { data } = await apiClient.get('/api/user/notifications', { params: { per_page: 20 } })
      if (!isMounted.current) return
      const items: UserNotification[] = data.data ?? data ?? []
      setUserNotifs(items)
      setLastUpdated(new Date())

      const newUnread = items.filter(n => !n.is_read).length
      if (silent && newUnread > prevUserUnread.current) {
        const newest = items.find(n => !n.is_read)
        if (newest) triggerNew({ title: newest.title, message: newest.message, type: newest.type, link: newest.link })
      }
      prevUserUnread.current = newUnread
    } catch { /* silently fail */ } finally {
      if (!silent && isMounted.current) setIsLoading(false)
    }
  }, [isAuthenticated, isOnline, triggerNew])

  // ── Fetch broadcast notifications ──────────────────────────────────────────
  const fetchBroadcast = useCallback(async () => {
    if (!isOnline) return
    try {
      const { data } = await apiClient.get('/api/notifications/broadcast', {
        params: { since: latestBroadcastId.current }
      })
      if (!isMounted.current) return
      const items: BroadcastNotification[] = data.data ?? []
      const newLatest: number = data.latest_id ?? 0

      if (items.length > 0) {
        if (latestBroadcastId.current > 0) {
          items.forEach(item => {
            if (!seenBroadcastIds.current.has(item.id)) {
              triggerNew({ title: item.title, message: item.message, type: item.type, link: item.link })
            }
          })
        }
        setBroadcastNotifs(prev => {
          const existingIds = new Set(prev.map(n => n.id))
          const newItems = items.filter(n => !existingIds.has(n.id))
          return [...newItems, ...prev].slice(0, 20)
        })
        setLastUpdated(new Date())
      }
      if (newLatest > latestBroadcastId.current) {
        latestBroadcastId.current = newLatest
      }
    } catch { /* silently fail */ }
  }, [isOnline, triggerNew])

  // ── Poll function ──────────────────────────────────────────────────────────
  const poll = useCallback((silent = true) => {
    fetchBroadcast()
    if (isAuthenticated) fetchUserNotifs(silent)
  }, [fetchBroadcast, fetchUserNotifs, isAuthenticated])

  // ── Setup polling với adaptive interval ───────────────────────────────────
  const startPolling = useCallback((interval: number) => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (interval === 0) return
    pollRef.current = setInterval(() => poll(true), interval)
  }, [poll])

  // ── Page Visibility API (mobile background handling) ───────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      isTabVisible.current = visible

      if (visible) {
        // Tab active lại → poll ngay + resume fast polling
        poll(true)
        startPolling(POLL_INTERVAL_ACTIVE)
      } else {
        // Tab ẩn → slow polling để tiết kiệm pin
        startPolling(POLL_INTERVAL_HIDDEN)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [poll, startPolling])

  // ── Online/Offline detection ───────────────────────────────────────────────
  useEffect(() => {
    const handleOnline  = () => { setIsOnline(true);  poll(true); startPolling(POLL_INTERVAL_ACTIVE) }
    const handleOffline = () => { setIsOnline(false); startPolling(POLL_INTERVAL_OFFLINE) }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [poll, startPolling])

  // ── Initial load + polling ─────────────────────────────────────────────────
  useEffect(() => {
    if (!prefs.enabled) {
      if (pollRef.current) clearInterval(pollRef.current)
      return
    }
    poll(false)
    startPolling(POLL_INTERVAL_ACTIVE)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [isAuthenticated, prefs.enabled, poll, startPolling])

  // ── Request browser notification permission ────────────────────────────────
  useEffect(() => {
    if (!prefs.showBrowser) return
    if ('Notification' in window && Notification.permission === 'default') {
      const t = setTimeout(() => Notification.requestPermission(), 3000)
      return () => clearTimeout(t)
    }
  }, [prefs.showBrowser])

  // ── Actions ────────────────────────────────────────────────────────────────
  const markUserRead = useCallback(async (id: number) => {
    try {
      await apiClient.post(`/api/user/notifications/${id}/read`)
      setUserNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch { /* ignore */ }
  }, [])

  const markAllRead = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await apiClient.post('/api/user/notifications/read-all')
        setUserNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
      }
      broadcastNotifs.forEach(n => seenBroadcastIds.current.add(n.id))
    } catch { /* ignore */ }
  }, [isAuthenticated, broadcastNotifs])

  const markBroadcastSeen = useCallback((id: number) => {
    seenBroadcastIds.current.add(id)
    // Force re-render để cập nhật badge count
    setBroadcastNotifs(prev => [...prev])
  }, [])

  const updatePrefs = useCallback((partial: Partial<NotificationPrefs>) => {
    setPrefs(prev => {
      const next = { ...prev, ...partial }
      savePrefs(next)
      return next
    })
  }, [])

  const refresh = useCallback(() => poll(false), [poll])

  return {
    userNotifs,
    broadcastNotifs,
    totalUnread,
    isLoading,
    isOnline,
    lastUpdated,
    prefs,
    markUserRead,
    markAllRead,
    markBroadcastSeen,
    updatePrefs,
    refresh,
  }
}
