'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  Bell, BellOff, X, CheckCheck, Package, ShoppingCart,
  Star, Info, AlertCircle, ExternalLink, Megaphone, Tag,
  Settings, Volume2, VolumeX, Monitor, Smartphone, RefreshCw,
  WifiOff,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import {
  useRealtimeNotifications,
  type UserNotification,
  type BroadcastNotification,
  type NotificationPrefs,
} from '@/hooks/use-realtime-notifications'

// ─── Icon & color map ─────────────────────────────────────────────────────────
const TYPE_MAP: Record<string, { icon: React.ElementType; bg: string; text: string; label: string }> = {
  order:   { icon: ShoppingCart, bg: 'bg-green-100',  text: 'text-green-600',  label: 'Đơn hàng'   },
  product: { icon: Package,      bg: 'bg-blue-100',   text: 'text-blue-600',   label: 'Sản phẩm'   },
  review:  { icon: Star,         bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Đánh giá'   },
  system:  { icon: AlertCircle,  bg: 'bg-red-100',    text: 'text-red-600',    label: 'Hệ thống'   },
  promo:   { icon: Tag,          bg: 'bg-purple-100', text: 'text-purple-600', label: 'Khuyến mãi' },
  info:    { icon: Info,         bg: 'bg-gray-100',   text: 'text-gray-600',   label: 'Thông tin'  },
}

function fmtTime(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (diff < 60) return 'Vừa xong'
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`
  return d.toLocaleDateString('vi-VN')
}

// ─── Toast (render qua portal để tránh bị clip bởi header) ───────────────────
interface ToastItem { id: string; title: string; message: string; type: string; link?: string }

function NotificationToast({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const { icon: Icon, bg, text } = TYPE_MAP[toast.type] ?? TYPE_MAP.info
  useEffect(() => {
    const t = setTimeout(onClose, 5000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className="pointer-events-auto flex w-80 items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-2xl">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon size={16} className={text} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{toast.title}</p>
        <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{toast.message}</p>
        {toast.link && (
          <Link href={toast.link} className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:underline">
            Xem chi tiết →
          </Link>
        )}
      </div>
      <button onClick={onClose} className="shrink-0 text-gray-300 hover:text-gray-500">
        <X size={14} />
      </button>
    </div>
  )
}

// Toast container dùng portal → render thẳng vào body, không bị z-index header chặn
function ToastPortal({ toasts, onClose }: { toasts: ToastItem[]; onClose: (id: string) => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted || !toasts.length) return null

  return createPortal(
    <div
      className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none"
      style={{ maxWidth: 320 }}
    >
      {toasts.map(t => (
        <NotificationToast key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>,
    document.body
  )
}

// ─── Settings Panel (dùng portal + fixed để không bị header che) ─────────────
function NotificationSettingsPortal({
  prefs,
  onUpdate,
  onClose,
  anchorRef,
}: {
  prefs: NotificationPrefs
  onUpdate: (p: Partial<NotificationPrefs>) => void
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}) {
  const [mounted, setMounted] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })

  useEffect(() => {
    setMounted(true)
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      })
    }
  }, [anchorRef])

  if (!mounted) return null

  const ALL_TYPES = Object.entries(TYPE_MAP)

  const toggleType = (type: string) => {
    const next = new Set(prefs.enabledTypes)
    if (next.has(type)) next.delete(type)
    else next.add(type)
    onUpdate({ enabledTypes: next })
  }

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative h-5 w-9 rounded-full transition-colors focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? '' : '-translate-x-4'}`} />
    </button>
  )

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed z-[9999] w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden"
        style={{ top: pos.top, right: pos.right }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <Settings size={15} className="text-gray-600" />
            <span className="text-sm font-semibold text-gray-900">Cài đặt thông báo</span>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X size={14} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-5">
          {/* Master toggle */}
          <div className="flex items-center gap-3">
            {prefs.enabled
              ? <Bell size={16} className="shrink-0 text-indigo-600" />
              : <BellOff size={16} className="shrink-0 text-gray-400" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Bật thông báo</p>
              <p className="text-xs text-gray-500">Tắt để dừng tất cả thông báo</p>
            </div>
            <Toggle checked={prefs.enabled} onChange={() => onUpdate({ enabled: !prefs.enabled })} />
          </div>

          {prefs.enabled && (
            <>
              {/* Display options */}
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hiển thị</p>

                <div className="flex items-center gap-3">
                  <Monitor size={14} className="shrink-0 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">Toast trong app</p>
                    <p className="text-xs text-gray-400">Popup góc dưới phải màn hình</p>
                  </div>
                  <Toggle checked={prefs.showToast} onChange={() => onUpdate({ showToast: !prefs.showToast })} />
                </div>

                <div className="flex items-center gap-3">
                  <Smartphone size={14} className="shrink-0 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">Thông báo hệ thống</p>
                    <p className="text-xs text-gray-400">Popup trình duyệt / mobile</p>
                  </div>
                  <Toggle checked={prefs.showBrowser} onChange={() => onUpdate({ showBrowser: !prefs.showBrowser })} />
                </div>

                <div className="flex items-center gap-3">
                  {prefs.playSound
                    ? <Volume2 size={14} className="shrink-0 text-gray-500" />
                    : <VolumeX size={14} className="shrink-0 text-gray-400" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">Âm thanh</p>
                    <p className="text-xs text-gray-400">Phát âm khi có thông báo mới</p>
                  </div>
                  <Toggle checked={prefs.playSound} onChange={() => onUpdate({ playSound: !prefs.playSound })} />
                </div>
              </div>

              {/* Type filters - dùng select thay grid button */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Loại thông báo nhận</p>
                <p className="text-xs text-gray-400">Bỏ chọn để ẩn loại thông báo đó</p>
                <div className="space-y-1.5">
                  {ALL_TYPES.map(([type, { icon: Icon, bg, text, label }]) => {
                    const active = prefs.enabledTypes.has(type)
                    return (
                      <label
                        key={type}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                          active ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleType(type)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${active ? bg : 'bg-gray-200'}`}>
                          <Icon size={12} className={active ? text : 'text-gray-400'} />
                        </div>
                        <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                          {label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

// ─── Main Bell Component ──────────────────────────────────────────────────────
export function NotificationBell() {
  const { isAuthenticated } = useAuth()
  const [open, setOpen]             = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [toasts, setToasts]         = useState<ToastItem[]>([])
  const wrapRef                     = useRef<HTMLDivElement>(null)
  const bellRef                     = useRef<HTMLButtonElement>(null)
  const seenRef                     = useRef<Set<number>>(new Set())

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev.slice(-2), { ...item, id }])
  }, [])

  const {
    userNotifs, broadcastNotifs, totalUnread,
    isLoading, isOnline, lastUpdated, prefs,
    markUserRead, markAllRead, markBroadcastSeen, updatePrefs, refresh,
  } = useRealtimeNotifications({
    isAuthenticated,
    onNewNotification: addToast,
  })

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleBellClick = () => {
    if (showSettings) {
      setShowSettings(false)
      return
    }
    const next = !open
    setOpen(next)
    if (next) {
      broadcastNotifs.forEach(n => seenRef.current.add(n.id))
    }
  }

  const openSettings = () => {
    setOpen(false)
    setShowSettings(true)
  }

  // Merge & sort
  type AnyNotif = (UserNotification | BroadcastNotification) & { _kind: 'user' | 'broadcast' }
  const allNotifs: AnyNotif[] = [
    ...broadcastNotifs.map(n => ({ ...n, _kind: 'broadcast' as const })),
    ...userNotifs.map(n => ({ ...n, _kind: 'user' as const })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <>
      {/* Toast portal - render vào body, z-index cao nhất */}
      <ToastPortal toasts={toasts} onClose={id => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Settings portal */}
      {showSettings && (
        <NotificationSettingsPortal
          prefs={prefs}
          onUpdate={updatePrefs}
          onClose={() => setShowSettings(false)}
          anchorRef={bellRef}
        />
      )}

      <div ref={wrapRef} className="relative">
        {/* Bell button */}
        <button
          ref={bellRef}
          onClick={handleBellClick}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Thông báo"
        >
          {prefs.enabled ? <Bell size={18} /> : <BellOff size={18} className="text-gray-300" />}
          {totalUnread > 0 && prefs.enabled && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
          {!isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-gray-400">
              <WifiOff size={8} className="text-white" />
            </span>
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">Thông báo</span>
                  {totalUnread > 0 && (
                    <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                      {totalUnread} mới
                    </span>
                  )}
                  {!isOnline && (
                    <span className="flex items-center gap-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                      <WifiOff size={9} /> Offline
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={refresh}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Làm mới"
                  >
                    <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                  {totalUnread > 0 && (
                    <button
                      onClick={markAllRead}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Đọc tất cả"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={openSettings}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Cài đặt thông báo"
                  >
                    <Settings size={14} />
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div className="max-h-[420px] overflow-y-auto">
                {isLoading && allNotifs.length === 0 ? (
                  <div className="space-y-3 p-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="h-8 w-8 animate-pulse rounded-xl bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
                          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : allNotifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                      <Bell size={24} className="text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Chưa có thông báo nào</p>
                    <p className="mt-1 text-xs text-gray-400">Thông báo mới sẽ xuất hiện ở đây</p>
                  </div>
                ) : (
                  allNotifs.map(notif => {
                    const { icon: Icon, bg, text } = TYPE_MAP[notif.type] ?? TYPE_MAP.info
                    const isBroadcast = notif._kind === 'broadcast'
                    const isUnread = isBroadcast
                      ? !seenRef.current.has(notif.id)
                      : !(notif as UserNotification).is_read

                    return (
                      <div
                        key={`${notif._kind}-${notif.id}`}
                        onClick={() => {
                          if (!isBroadcast) markUserRead(notif.id)
                          else { seenRef.current.add(notif.id); markBroadcastSeen(notif.id) }
                        }}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${isUnread ? 'bg-indigo-50/40' : ''}`}
                      >
                        <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                          <Icon size={14} className={text} />
                          {isBroadcast && (
                            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500">
                              <Megaphone size={8} className="text-white" />
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold leading-snug ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notif.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                          <p className="mt-1 text-[10px] text-gray-400">{fmtTime(notif.created_at)}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
                          {isUnread && <span className="h-2 w-2 rounded-full bg-indigo-500" />}
                          {notif.link && (
                            <Link
                              href={notif.link}
                              onClick={e => { e.stopPropagation(); setOpen(false) }}
                              className="text-gray-300 hover:text-indigo-500 transition-colors"
                            >
                              <ExternalLink size={11} />
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between">
                {!isAuthenticated ? (
                  <p className="text-xs text-gray-400">
                    <Link
                      href="/login"
                      className="font-medium text-indigo-600 hover:underline"
                      onClick={() => setOpen(false)}
                    >
                      Đăng nhập
                    </Link>{' '}
                    để xem thông báo cá nhân
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    {lastUpdated ? `Cập nhật ${fmtTime(lastUpdated.toISOString())}` : 'Đang tải...'}
                  </p>
                )}
                <button
                  onClick={openSettings}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  <Settings size={11} /> Cài đặt
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
