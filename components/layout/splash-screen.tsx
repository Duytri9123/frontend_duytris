'use client'

import { useEffect } from 'react'
import { useSiteSettings } from '@/hooks/use-site-settings'

/**
 * SplashScreen — chỉ làm 2 việc:
 * 1. Áp dụng hiệu ứng động (effect layer) sau khi settings load
 * 2. Ẩn #splash-root khi settings load xong
 *
 * Màu / tên / logo đã được nhúng đúng từ server trong layout.tsx
 * → không có flash màu mặc định nữa.
 */

interface Props {
  splashEnabled: boolean
}

export function SplashScreen({ splashEnabled }: Props) {
  const { settings, loading } = useSiteSettings()

  useEffect(() => {
    if (!splashEnabled) return
    if (loading) return

    const root    = document.getElementById('splash-root')
    if (!root) return

    const effect  = settings.splash_effect || 'particles'
    const color   = settings.primary_color || '#6366f1'
    const logoUrl = settings.logo_url
    const siteName = settings.site_name || 'D'

    // Áp dụng hiệu ứng động
    applyEffect(root, effect, color)

    const icon    = root.querySelector('#sp-icon')    as HTMLElement | null
    const logoImg = root.querySelector('#sp-logo-img') as HTMLImageElement | null

    const doHide = () => {
      root.classList.add('splash-hiding')
      setTimeout(() => root.remove(), 650)
    }

    if (logoUrl && logoImg) {
      // Resolve URL nếu cần
      const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const resolvedUrl = logoUrl.startsWith('http') ? logoUrl : `${API}/${logoUrl.replace(/^\//, '')}`

      if (logoImg.complete && logoImg.naturalWidth > 0) {
        // Ảnh đã load xong (từ cache hoặc server-side src)
        if (icon) icon.style.display = 'none'
        logoImg.style.display = 'block'
        logoImg.style.animation = 'spLogoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both'
        setTimeout(doHide, 300)
      } else {
        // Ảnh chưa load — icon chữ cái đang hiện, chờ ảnh load xong
        logoImg.src = resolvedUrl
        logoImg.onload = () => {
          // Swap mượt: fade icon ra, fade logo vào
          if (icon) {
            icon.style.transition = 'opacity 0.25s'
            icon.style.opacity = '0'
            setTimeout(() => {
              if (icon) icon.style.display = 'none'
              logoImg.style.display = 'block'
              logoImg.style.animation = 'spLogoIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both'
            }, 250)
          } else {
            logoImg.style.display = 'block'
          }
          setTimeout(doHide, 500)
        }
        logoImg.onerror = () => {
          // Logo lỗi — giữ icon chữ cái, ẩn splash bình thường
          if (icon) icon.textContent = siteName[0]?.toUpperCase() ?? 'D'
          setTimeout(doHide, 300)
        }
      }
    } else {
      // Không có logo — dùng icon chữ cái
      if (icon) icon.textContent = siteName[0]?.toUpperCase() ?? 'D'
      setTimeout(doHide, 300)
    }
  }, [loading, settings, splashEnabled])

  // Fallback 5s — phòng trường hợp API lỗi
  useEffect(() => {
    if (!splashEnabled) return
    const t = setTimeout(() => {
      const root = document.getElementById('splash-root')
      if (!root) return
      root.classList.add('splash-hiding')
      setTimeout(() => root.remove(), 650)
    }, 5000)
    return () => clearTimeout(t)
  }, [splashEnabled])

  return null
}

// ── Áp dụng hiệu ứng động ────────────────────────────────────────────────────
function applyEffect(root: HTMLElement, effect: string, color: string) {
  root.querySelectorAll('.sp-effect-layer').forEach(el => el.remove())

  const layer = document.createElement('div')
  layer.className = 'sp-effect-layer'
  layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;'

  switch (effect) {

    case 'matrix': {
      const chars = '01アイウエオ∑∆∇∈'
      for (let i = 0; i < 12; i++) {
        const col = document.createElement('div')
        col.style.cssText = `
          position:absolute; top:-20px; font-family:monospace; font-size:11px;
          color:${color}; opacity:0.22; white-space:pre; line-height:1.6;
          left:${5 + i * 8}%;
          animation:spMatrixFall ${2 + Math.random() * 3}s ${Math.random() * 2}s linear infinite;
        `
        col.textContent = Array.from({ length: 10 }, () =>
          chars[Math.floor(Math.random() * chars.length)]
        ).join('\n')
        layer.appendChild(col)
      }
      injectKF('spMatrixFall', `
        from { transform:translateY(-100%); opacity:.3; }
        to   { transform:translateY(120vh); opacity:0; }
      `)
      break
    }

    case 'bubbles': {
      for (let i = 0; i < 16; i++) {
        const b = document.createElement('div')
        const size = 8 + Math.random() * 22
        b.style.cssText = `
          position:absolute; border-radius:50%;
          width:${size}px; height:${size}px;
          border:1.5px solid ${color}; opacity:${0.12 + Math.random() * 0.2};
          left:${Math.random() * 92}%; bottom:-${size}px;
          animation:spBubble ${3 + Math.random() * 4}s ${Math.random() * 3}s ease-in infinite;
        `
        layer.appendChild(b)
      }
      injectKF('spBubble', `
        0%   { transform:translateY(0) scale(1); opacity:.25; }
        80%  { opacity:.15; }
        100% { transform:translateY(-110vh) scale(.5); opacity:0; }
      `)
      break
    }

    case 'wave': {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('viewBox', '0 0 1440 120')
      svg.setAttribute('preserveAspectRatio', 'none')
      svg.style.cssText = 'position:absolute;bottom:0;left:0;width:100%;height:80px;'
      svg.innerHTML = `
        <path fill="${color}" fill-opacity="0.13"
          d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z">
          <animate attributeName="d" dur="4s" repeatCount="indefinite" values="
            M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z;
            M0,40 C240,20 480,100 720,40 C960,20 1200,100 1440,40 L1440,120 L0,120 Z;
            M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"/>
        </path>
        <path fill="${color}" fill-opacity="0.07"
          d="M0,80 C360,40 720,120 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z">
          <animate attributeName="d" dur="6s" repeatCount="indefinite" values="
            M0,80 C360,40 720,120 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z;
            M0,90 C360,120 720,40 1080,90 C1260,110 1380,70 1440,90 L1440,120 L0,120 Z;
            M0,80 C360,40 720,120 1080,80 C1260,60 1380,90 1440,80 L1440,120 L0,120 Z"/>
        </path>
      `
      layer.appendChild(svg)
      break
    }

    case 'glitch': {
      for (let i = 0; i < 3; i++) {
        const bar = document.createElement('div')
        bar.style.cssText = `
          position:absolute; left:0; right:0; height:2px;
          background:linear-gradient(90deg, transparent, ${color}40, transparent);
          top:${20 + i * 30}%;
          animation:spGlitchScan ${1.5 + i * 0.7}s ${i * 0.3}s ease-in-out infinite;
        `
        layer.appendChild(bar)
      }
      for (let i = 0; i < 4; i++) {
        const block = document.createElement('div')
        block.style.cssText = `
          position:absolute; height:3px; background:${color}; opacity:0;
          width:${20 + Math.random() * 40}%; left:${Math.random() * 60}%;
          top:${10 + i * 22}%;
          animation:spGlitchBlock ${0.8 + Math.random()}s ${i * 0.4}s steps(1) infinite;
        `
        layer.appendChild(block)
      }
      injectKF('spGlitchScan', `
        0%,100%{transform:translateY(0);opacity:.6}
        50%{transform:translateY(8px);opacity:.2}
      `)
      injectKF('spGlitchBlock', `
        0%,90%,100%{opacity:0;transform:translateX(0)}
        92%{opacity:.7;transform:translateX(-8px)}
        95%{opacity:.4;transform:translateX(5px)}
      `)
      break
    }

    case 'aurora': {
      const colors = [color, '#818cf8', '#a5b4fc', '#c7d2fe']
      for (let i = 0; i < 4; i++) {
        const orb = document.createElement('div')
        orb.style.cssText = `
          position:absolute; border-radius:50%; filter:blur(70px);
          width:${300 + i * 80}px; height:${200 + i * 60}px;
          background:radial-gradient(ellipse, ${colors[i]}25, transparent 70%);
          top:${-10 + i * 20}%; left:${-10 + i * 25}%;
          animation:spAurora ${5 + i * 2}s ${i * 1.2}s ease-in-out infinite alternate;
        `
        layer.appendChild(orb)
      }
      injectKF('spAurora', `
        from{transform:translate(0,0) scale(1)}
        to{transform:translate(40px,30px) scale(1.15)}
      `)
      break
    }

    case 'ripple': {
      const center = document.createElement('div')
      center.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;'
      for (let i = 4; i <= 7; i++) {
        const ring = document.createElement('div')
        ring.style.cssText = `
          position:absolute; border-radius:50%;
          border:1px solid ${color}; opacity:.15;
          width:${i * 55}px; height:${i * 55}px;
          animation:spRippleOut 3s ${i * 0.4}s ease-out infinite;
        `
        center.appendChild(ring)
      }
      layer.appendChild(center)
      injectKF('spRippleOut', `
        0%{transform:scale(.5);opacity:.5}
        100%{transform:scale(1.8);opacity:0}
      `)
      break
    }

    case 'particles':
    default: {
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('div')
        const size = 3 + Math.random() * 5
        p.style.cssText = `
          position:absolute; border-radius:50%;
          width:${size}px; height:${size}px;
          background:${color}; opacity:${0.15 + Math.random() * 0.3};
          top:${Math.random() * 90}%; left:${Math.random() * 90}%;
          animation:spExtraP ${3 + Math.random() * 4}s ${Math.random() * 2}s ease-in-out infinite;
        `
        layer.appendChild(p)
      }
      injectKF('spExtraP', `
        0%,100%{transform:translateY(0) scale(1);opacity:.25}
        50%{transform:translateY(-28px) scale(1.6);opacity:.6}
      `)
      break
    }
  }

  root.insertBefore(layer, root.firstChild)
}

const _kf = new Set<string>()
function injectKF(name: string, body: string) {
  if (_kf.has(name)) return
  _kf.add(name)
  const s = document.createElement('style')
  s.textContent = `@keyframes ${name}{${body}}`
  document.head.appendChild(s)
}
