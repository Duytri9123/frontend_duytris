import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface SiteSettings {
  site_name: string
  site_description: string
  primary_color: string
  secondary_color: string
  accent_color: string
  font_family: string
  logo_url: string | null
  favicon_url: string | null
  banner_text: string
  banner_enabled: string
  facebook_url: string
  instagram_url: string
  meta_title: string
  meta_description: string
  // Splash screen
  splash_enabled: string
  splash_effect: string
  splash_tagline: string
  splash_bg_style: string
  [key: string]: string | null
}

const DEFAULT: SiteSettings = {
  site_name: 'DT Shop',
  site_description: 'Mua sắm trực tuyến',
  primary_color: '#6366f1',
  secondary_color: '#f59e0b',
  accent_color: '#10b981',
  font_family: 'Inter',
  logo_url: null,
  favicon_url: null,
  banner_text: 'Miễn phí vận chuyển cho đơn hàng trên 500k',
  banner_enabled: '1',
  facebook_url: '',
  instagram_url: '',
  meta_title: 'DT Shop',
  meta_description: 'Mua sắm trực tuyến giá tốt',
  // Splash defaults
  splash_enabled: '1',
  splash_effect: 'particles',
  splash_tagline: 'Mua sắm trực tuyến dễ dàng',
  splash_bg_style: 'gradient',
}

// ── Singleton: chỉ fetch 1 lần, chia sẻ giữa tất cả component ────────────────
let _settings: SiteSettings = DEFAULT
let _loading = true
let _fetched = false
const _listeners = new Set<() => void>()

function notify() { _listeners.forEach(fn => fn()) }

function fetchSettingsOnce() {
  if (_fetched) return
  _fetched = true
  apiClient.get('/api/settings/flat')
    .then(({ data }) => {
      _settings = { ...DEFAULT, ...data.data }
    })
    .catch(() => { _fetched = false }) // retry on error
    .finally(() => {
      _loading = false
      notify()
    })
}

export function useSiteSettings() {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1)
    _listeners.add(update)
    return () => { _listeners.delete(update) }
  }, [])

  useEffect(() => {
    fetchSettingsOnce()
  }, [])

  return { settings: _settings, loading: _loading }
}
