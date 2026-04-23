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
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.get('/api/settings/flat')
      .then(({ data }) => setSettings({ ...DEFAULT, ...data.data }))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { settings, loading }
}
