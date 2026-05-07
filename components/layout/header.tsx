'use client'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, X, User, LogOut, Package, Mic, MicOff, Camera, Loader2 } from 'lucide-react'
import { Navigation } from './navigation'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { useAuth } from '@/hooks/use-auth'
import { useCartStore } from '@/stores/cart-store'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function resolveImg(url?: string | null) {
  if (!url) return null
  if (url.startsWith('http')) return url
  return `${API}/${url.replace(/^\//, '')}`
}

// ─── Product suggestion item type ────────────────────────────────────────────
interface SuggestProduct {
  id: number
  name: string
  slug: string
  thumbnail?: string | null
  price?: number | null
  sale_price?: number | null
}

// ─── Desktop Search Tooltip ───────────────────────────────────────────────────
function DesktopSearchTooltip({
  primaryColor,
  onClose,
}: {
  primaryColor: string
  onClose: () => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [suggestions, setSuggestions] = useState<SuggestProduct[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const recognitionRef = useRef<any>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SR)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  // Debounced suggestions fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setSuggestions([]); return }
    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const { data } = await apiClient.get<{ data: SuggestProduct[] }>('/api/products', {
          params: { search: query.trim(), per_page: 6, status: 'active' },
        })
        setSuggestions(data.data ?? [])
      } catch {
        setSuggestions([])
      } finally {
        setLoadingSuggestions(false)
      }
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      onClose()
    }
  }

  const handleSelectSuggestion = (slug: string) => {
    router.push(`/products/${slug}`)
    onClose()
  }

  // Voice search
  const toggleVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'vi-VN'; r.continuous = false; r.interimResults = true
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onresult = (e: any) => {
      const t = Array.from(e.results as any[]).map((x: any) => x[0].transcript).join('')
      setQuery(t)
      if (e.results[e.results.length - 1].isFinal) {
        router.push(`/products?search=${encodeURIComponent(t)}`)
        onClose()
      }
    }
    r.onerror = () => setListening(false)
    recognitionRef.current = r; r.start()
  }, [listening, router, onClose])

  // Image search
  const handleImageSearch = async (file: File) => {
    setAnalyzing(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string
        try {
          const { data } = await apiClient.post('/api/ai/customer-chat', {
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: 'Đây là ảnh sản phẩm. Hãy mô tả ngắn gọn sản phẩm trong ảnh (tên loại sản phẩm, màu sắc, đặc điểm) để tôi có thể tìm kiếm. Chỉ trả về từ khóa tìm kiếm, không giải thích.' },
                { type: 'image_url', image_url: { url: base64 } }
              ]
            }],
            has_image: true,
          })
          const keywords = data.content?.trim()
          if (keywords) {
            setQuery(keywords)
            router.push(`/products?search=${encodeURIComponent(keywords)}`)
            onClose()
          }
        } catch {
          setQuery('Không thể phân tích ảnh')
        } finally {
          setAnalyzing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setAnalyzing(false)
    }
  }

  const displayPrice = (p: SuggestProduct) => {
    const price = p.sale_price ?? p.price
    if (!price) return null
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)
  }

  return (
    <div ref={wrapperRef} className="w-[440px]">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={listening ? '🎤 Đang nghe...' : 'Tìm kiếm sản phẩm...'}
            className={`w-full rounded-xl border py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
              listening ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }`}
          />
          {query && (
            <button type="button" onClick={() => { setQuery(''); setSuggestions([]) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={13} />
            </button>
          )}
        </div>

        {voiceSupported && (
          <button type="button" onClick={toggleVoice}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors ${
              listening ? 'bg-red-500 text-white animate-pulse' : 'border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
            }`}
            title={listening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
          >
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}

        <button type="button" onClick={() => imgRef.current?.click()} disabled={analyzing}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-300 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors disabled:opacity-50"
          title="Tìm kiếm bằng hình ảnh"
        >
          {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
        </button>

        <button type="submit"
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          <Search size={14} /> Tìm
        </button>

        <input ref={imgRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSearch(f); e.target.value = '' }} />
      </form>

      {/* Suggestions */}
      {(loadingSuggestions || suggestions.length > 0) && (
        <div className="mt-2 border-t border-gray-100 pt-2">
          {loadingSuggestions ? (
            <div className="flex items-center justify-center py-4 text-gray-400">
              <Loader2 size={16} className="animate-spin mr-2" />
              <span className="text-xs">Đang tìm...</span>
            </div>
          ) : (
            <>
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400 px-1">
                Gợi ý sản phẩm
              </p>
              <ul>
                {suggestions.map(p => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectSuggestion(p.slug)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left hover:bg-gray-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        {resolveImg(p.thumbnail) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={resolveImg(p.thumbnail)!}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-300">
                            <ShoppingCart size={14} />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">{p.name}</p>
                        {displayPrice(p) && (
                          <p className="text-xs font-bold text-indigo-600">{displayPrice(p)}</p>
                        )}
                      </div>
                      <Search size={13} className="shrink-0 text-gray-300" />
                    </button>
                  </li>
                ))}
              </ul>
              {suggestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => { router.push(`/products?search=${encodeURIComponent(query.trim())}`); onClose() }}
                  className="mt-1 w-full rounded-xl py-2 text-center text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  Xem tất cả kết quả cho &ldquo;{query}&rdquo; →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Mobile Smart Search Bar ──────────────────────────────────────────────────
function SmartSearchBar({ primaryColor, onClose }: { primaryColor: string; onClose?: () => void }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [listening, setListening] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const imgRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    setVoiceSupported(!!SR)
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`)
      onClose?.()
    }
  }

  const toggleVoice = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const r = new SR()
    r.lang = 'vi-VN'; r.continuous = false; r.interimResults = true
    r.onstart = () => setListening(true)
    r.onend = () => setListening(false)
    r.onresult = (e: any) => {
      const t = Array.from(e.results as any[]).map((x: any) => x[0].transcript).join('')
      setQuery(t)
      if (e.results[e.results.length - 1].isFinal) {
        router.push(`/products?search=${encodeURIComponent(t)}`)
        onClose?.()
      }
    }
    r.onerror = () => setListening(false)
    recognitionRef.current = r; r.start()
  }, [listening, router, onClose])

  const handleImageSearch = async (file: File) => {
    setAnalyzing(true)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        try {
          const { data } = await apiClient.post('/api/ai/customer-chat', {
            messages: [{
              role: 'user',
              content: [
                { type: 'text', text: 'Đây là ảnh sản phẩm. Hãy mô tả ngắn gọn sản phẩm trong ảnh (tên loại sản phẩm, màu sắc, đặc điểm) để tôi có thể tìm kiếm. Chỉ trả về từ khóa tìm kiếm, không giải thích.' },
                { type: 'image_url', image_url: { url: base64 } }
              ]
            }],
            has_image: true,
          })
          const keywords = data.content?.trim()
          if (keywords) {
            setQuery(keywords)
            router.push(`/products?search=${encodeURIComponent(keywords)}`)
            onClose?.()
          }
        } catch {
          setQuery('Không thể phân tích ảnh')
        } finally {
          setAnalyzing(false)
        }
      }
      reader.readAsDataURL(file)
    } catch {
      setAnalyzing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={listening ? '🎤 Đang nghe...' : 'Tìm kiếm sản phẩm...'}
          className={`w-full h-9 rounded-xl border py-0 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 transition-all ${
            listening ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>
      {voiceSupported && (
        <button type="button" onClick={toggleVoice}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
            listening ? 'bg-red-500 text-white animate-pulse' : 'border border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
          }`}
          title={listening ? 'Dừng ghi âm' : 'Tìm kiếm bằng giọng nói'}
        >
          {listening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>
      )}
      <button type="button" onClick={() => imgRef.current?.click()} disabled={analyzing}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors disabled:opacity-50"
        title="Tìm kiếm bằng hình ảnh"
      >
        {analyzing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
      </button>
      <button type="submit"
        className="flex h-9 shrink-0 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-white transition-colors hover:opacity-90"
        style={{ backgroundColor: primaryColor }}
      >
        <Search size={13} /> Tìm
      </button>
      <input ref={imgRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handleImageSearch(f); e.target.value = '' }} />
    </form>
  )
}

// ─── Main Header ──────────────────────────────────────────────────────────────
export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const totalItems = useCartStore((s) => s.totalItems())
  const { settings } = useSiteSettings()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const primaryColor = settings.primary_color || '#6366f1'
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const dismissBanner = () => setBannerDismissed(true)

  return (
    <>
      {/* Wrapper sticky bao cả banner + header — scroll cùng nhau */}
      <div className="sticky top-0 z-50 w-full">
        {/* Announcement Banner */}
        {settings.banner_enabled === '1' && settings.banner_text && !bannerDismissed && (
          <div
            className="relative w-full overflow-hidden"
            style={{ backgroundColor: primaryColor }}
          >
            {/* Desktop: text căn giữa, truncate */}
            <p className="hidden sm:block py-2 px-10 text-center text-xs font-medium text-white truncate">
              {settings.banner_text}
            </p>
            {/* Mobile: marquee scroll khi text dài */}
            <div className="flex sm:hidden items-center py-2 overflow-hidden pr-8">
              <span
                className="whitespace-nowrap text-xs font-medium text-white"
                style={{
                  paddingLeft: '1rem',
                  animation: settings.banner_text.length > 35
                    ? 'bannerScroll 16s linear infinite'
                    : 'none',
                  display: 'inline-block',
                }}
              >
                {settings.banner_text}
                {settings.banner_text.length > 35 && (
                  <span style={{ marginLeft: '4rem' }}>{settings.banner_text}</span>
                )}
              </span>
            </div>
            {/* Nút đóng */}
            <button
              onClick={dismissBanner}
              aria-label="Đóng thông báo"
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/35 transition-colors"
            >
              <X size={11} />
            </button>
            <style>{`
              @keyframes bannerScroll {
                0%   { transform: translateX(100vw); }
                100% { transform: translateX(-100%); }
              }
            `}</style>
          </div>
        )}

        <header className="relative w-full border-b bg-white/95 backdrop-blur shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          {/* Left: hamburger + logo (mobile) / logo only (desktop) */}
          <div className="flex items-center gap-2">
            {/* Mobile menu toggle — left side on mobile */}
            <button onClick={() => { setMobileOpen(p => !p); setSearchOpen(false); setUserMenuOpen(false); setMobileSearchOpen(false) }} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 md:hidden">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {settings.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resolveImg(settings.logo_url)!}
                alt={settings.site_name || 'Shop'}
                className="h-9 w-auto object-contain"
              />
            ) : (
              <span className="text-xl font-bold" style={{ color: primaryColor, fontFamily: settings.font_family }}>
                {settings.site_name || 'EShop'}
              </span>
            )}
          </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <Navigation />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">

            {/* Desktop search — icon + absolute tooltip (desktop only) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setSearchOpen(p => !p)}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${searchOpen ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {searchOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-gray-200 bg-white shadow-xl px-3 py-2">
                  {/* Arrow */}
                  <div className="absolute -top-[7px] right-3 h-3 w-3 rotate-45 border-l border-t border-gray-200 bg-white" />
                  <DesktopSearchTooltip
                    primaryColor={primaryColor}
                    onClose={() => setSearchOpen(false)}
                  />
                </div>
              )}
            </div>

            {/* Mobile search toggle */}
            <button
              onClick={() => { setMobileSearchOpen(p => !p); setMobileOpen(false) }}
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:hidden ${mobileSearchOpen ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={() => { setMobileOpen(false); setSearchOpen(false); setMobileSearchOpen(false) }}>
              <ShoppingCart size={18} />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: primaryColor }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Notification bell */}
            <NotificationBell />

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => { setUserMenuOpen(p => !p); setMobileOpen(false); setSearchOpen(false); setMobileSearchOpen(false) }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: primaryColor }}
                >
                  {user?.name?.[0]?.toUpperCase() ?? 'U'}
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <User size={14} /> Tài khoản
                        </Link>
                        <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Package size={14} /> Đơn hàng của tôi
                        </Link>
                        <button onClick={() => { logout(); setUserMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                          <LogOut size={14} /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">Đăng nhập</Link>
                <Link href="/register" className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90" style={{ backgroundColor: primaryColor }}>Đăng ký</Link>
              </div>
            )}

            {/* Mobile menu toggle — moved to left side */}
          </div>
        </div>

        {/* Mobile search bar — overlay */}
        {mobileSearchOpen && (
          <div
            className="absolute left-0 right-0 z-50 border-t border-gray-100 bg-white px-3 py-2 shadow-lg md:hidden"
            onClick={e => e.stopPropagation()}
          >
            <SmartSearchBar primaryColor={primaryColor} onClose={() => setMobileSearchOpen(false)} />
          </div>
        )}

        {/* Mobile nav — overlay, không đẩy nội dung */}
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 top-[var(--header-h,64px)] z-40 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)} />
            <div className="absolute left-0 right-0 z-50 border-t border-gray-100 bg-white px-4 py-4 shadow-lg md:hidden">
              <Navigation mobile onClose={() => setMobileOpen(false)} />
              {!isAuthenticated && (
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="flex-1 rounded-lg border border-gray-300 py-2 text-center text-sm font-medium text-gray-700">Đăng nhập</Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)} className="flex-1 rounded-lg py-2 text-center text-sm font-semibold text-white" style={{ backgroundColor: primaryColor }}>Đăng ký</Link>
                </div>
              )}
            </div>
          </>
        )}
        </header>
      </div>
    </>
  )
}
