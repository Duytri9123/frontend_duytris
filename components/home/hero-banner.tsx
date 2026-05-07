'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react'

interface Banner {
  id: number
  title: string
  subtitle?: string
  image_url: string
  aspect_ratio?: string
  link_url?: string
  button_text?: string
  button_style?: string // JSON string
  text_overlays?: string // JSON string
}

interface TextOverlay {
  id: string
  text: string
  fontSize: number
  color: string
  position: { x: number; y: number }
  fontWeight: string
  animation?: string
  // New fields
  bgColor?: string
  bgOpacity?: number
  borderColor?: string
  borderWidth?: number
  borderRadius?: number
  paddingX?: number
  paddingY?: number
  italic?: boolean
  letterSpacing?: number
}

interface HeroBannerProps {
  banners: Banner[]
  autoplayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  transition?: 'fade' | 'slide' | 'zoom'
}

// CSS animations injected once
const ANIMATION_CSS = `
@keyframes bannerFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes bannerSlideLeft {
  from { opacity: 0; transform: translate(calc(-50% - 40px), -50%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
@keyframes bannerSlideRight {
  from { opacity: 0; transform: translate(calc(-50% + 40px), -50%); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
@keyframes bannerSlideUp {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 30px)); }
  to { opacity: 1; transform: translate(-50%, -50%); }
}
@keyframes bannerBounce {
  0%   { opacity: 0; transform: translate(-50%, calc(-50% - 20px)); }
  60%  { opacity: 1; transform: translate(-50%, calc(-50% + 6px)); }
  80%  { transform: translate(-50%, calc(-50% - 4px)); }
  100% { transform: translate(-50%, -50%); }
}
@keyframes bannerZoomIn {
  from { opacity: 0; transform: translate(-50%, -50%) scale(0.7); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
@keyframes bannerSlide {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}
@keyframes bannerZoom {
  from { transform: scale(1); }
  to   { transform: scale(1.06); }
}
.banner-text-fade-in   { animation: bannerFadeIn   0.7s ease both; }
.banner-text-slide-left  { animation: bannerSlideLeft  0.6s ease both; }
.banner-text-slide-right { animation: bannerSlideRight 0.6s ease both; }
.banner-text-slide-up    { animation: bannerSlideUp    0.6s ease both; }
.banner-text-bounce      { animation: bannerBounce     0.8s ease both; }
.banner-text-zoom-in     { animation: bannerZoomIn     0.6s ease both; }
.banner-text-none        {}
`

function useInjectCSS(css: string) {
  useEffect(() => {
    if (document.getElementById('hero-banner-css')) return
    const style = document.createElement('style')
    style.id = 'hero-banner-css'
    style.textContent = css
    document.head.appendChild(style)
  }, [css])
}

export function HeroBanner({
  banners,
  autoplayInterval = 5000,
  showArrows = true,
  showDots = true,
  transition = 'fade',
}: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [animKey, setAnimKey] = useState(0) // re-trigger text animations on slide change
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useInjectCSS(ANIMATION_CSS)

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (banners.length <= 1) return
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p + 1) % banners.length)
      setAnimKey((k) => k + 1)
    }, autoplayInterval)
  }

  useEffect(() => {
    resetTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners.length, autoplayInterval])

  if (banners.length === 0) return null

  const goTo = (idx: number) => {
    setCurrent(idx)
    setAnimKey((k) => k + 1)
    resetTimer()
  }
  const prev = () => goTo((current - 1 + banners.length) % banners.length)
  const next = () => goTo((current + 1) % banners.length)

  const banner = banners[current]
  const aspect = banner.aspect_ratio ?? '16:5'

  let textOverlays: TextOverlay[] = []
  try {
    textOverlays = banner.text_overlays ? JSON.parse(banner.text_overlays) : []
  } catch {
    textOverlays = []
  }

  // Parse button style
  const defaultBtnStyle = {
    position: { x: 50, y: 85 },
    bgColor: '#ffffff', bgOpacity: 0.15,
    textColor: '#ffffff', borderColor: '#ffffff', borderWidth: 2,
    borderRadius: 999, paddingX: 1.6, paddingY: 0.7,
    fontSize: 20, fontWeight: 'bold', showIcon: true,
  }
  let btnStyle = defaultBtnStyle
  try {
    if (banner.button_style) {
      const parsed = { ...defaultBtnStyle, ...JSON.parse(banner.button_style) }
      // Migrate old px paddingX/Y (> 5) → em
      if (parsed.paddingX > 5) parsed.paddingX = Math.round((parsed.paddingX / 14) * 10) / 10
      if (parsed.paddingY > 5) parsed.paddingY = Math.round((parsed.paddingY / 14) * 10) / 10
      // Migrate old px fontSize (> 10) → cqw units (value / 10 = cqw)
      if (parsed.fontSize > 10) parsed.fontSize = Math.round(parsed.fontSize * 1.5)
      btnStyle = parsed
    }
  } catch {
    btnStyle = defaultBtnStyle
  }

  // Transition classes for the image
  const imgTransitionClass =
    transition === 'slide'
      ? 'transition-transform duration-700'
      : transition === 'zoom'
      ? 'transition-transform duration-[1200ms] scale-[1.04] group-[.active]:scale-100'
      : 'transition-opacity duration-700' // fade (default)

  return (
    <section
      className="relative overflow-hidden bg-gray-900 group w-full"
      style={{
        aspectRatio: aspect.replace(':', '/'),
        containerType: 'inline-size',
      }}
    >
      {/* Images — stack all, show current */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100 z-[1]' : 'opacity-0 z-0'
          }`}
        >
          {b.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={b.image_url}
              alt={b.title}
              className={`h-full w-full object-cover ${
                transition === 'zoom' && i === current
                  ? 'scale-[1.04] transition-transform duration-[8000ms] ease-linear'
                  : 'scale-100'
              } ${imgTransitionClass}`}
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          )}
        </div>
      ))}

      {/* Text Overlays — only for current banner, re-animate on change */}
      <div className="absolute inset-0 z-[2] pointer-events-none" key={`overlays-${current}-${animKey}`}>
        {textOverlays.map((overlay, idx) => {
          const animClass = overlay.animation && overlay.animation !== 'none'
            ? `banner-text-${overlay.animation}`
            : ''
          const animDelay = `${idx * 0.15}s`

          // Background style
          const hasBg = overlay.bgColor && (overlay.bgOpacity ?? 0) > 0
          const bgRgba = hasBg
            ? hexToRgba(overlay.bgColor!, overlay.bgOpacity ?? 0.5)
            : 'transparent'

          // Border style
          const hasBorder = overlay.borderColor && (overlay.borderWidth ?? 0) > 0

          return (
            <div
              key={overlay.id}
              className={animClass}
              style={{
                position: 'absolute',
                left: `${overlay.position.x}%`,
                top: `${overlay.position.y}%`,
                transform: 'translate(-50%, -50%)',
                fontSize: `${overlay.fontSize / 10}cqw`,
                color: overlay.color,
                fontWeight: overlay.fontWeight,
                fontStyle: overlay.italic ? 'italic' : 'normal',
                letterSpacing: overlay.letterSpacing ? `${overlay.letterSpacing}px` : undefined,
                textShadow: !hasBg ? '2px 2px 4px rgba(0,0,0,0.7)' : 'none',
                whiteSpace: 'nowrap',
                animationDelay: animDelay,
                // Background & border
                backgroundColor: bgRgba,
                border: hasBorder
                  ? `${overlay.borderWidth}px solid ${overlay.borderColor}`
                  : 'none',
                borderRadius: overlay.borderRadius ? `${overlay.borderRadius}px` : undefined,
                paddingLeft: overlay.paddingX ? `${overlay.paddingX}em` : hasBg ? '0.8em' : undefined,
                paddingRight: overlay.paddingX ? `${overlay.paddingX}em` : hasBg ? '0.8em' : undefined,
                paddingTop: overlay.paddingY ? `${overlay.paddingY}em` : hasBg ? '0.4em' : undefined,
                paddingBottom: overlay.paddingY ? `${overlay.paddingY}em` : hasBg ? '0.4em' : undefined,
              }}
            >
              {overlay.text}
            </div>
          )
        })}
      </div>

      {/* CTA Button — positioned by button_style */}
      {banner.button_text && (
        <div
          className="absolute z-[3]"
          key={`cta-${current}-${animKey}`}
          style={{
            left: `${btnStyle.position.x}%`,
            top: `${btnStyle.position.y}%`,
            transform: 'translate(-50%, -50%)',
            animation: 'bannerFadeIn 0.6s ease 0.4s both',
          }}
        >
          {banner.link_url ? (
            <Link
              href={banner.link_url}
              className="inline-flex items-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-95"
              style={{
                color: btnStyle.textColor,
                backgroundColor: hexToRgba(btnStyle.bgColor, btnStyle.bgOpacity),
                border: btnStyle.borderWidth > 0 ? `${btnStyle.borderWidth}px solid ${btnStyle.borderColor}` : 'none',
                borderRadius: `${btnStyle.borderRadius}px`,
                paddingLeft: `${btnStyle.paddingX}em`,
                paddingRight: `${btnStyle.paddingX}em`,
                paddingTop: `${btnStyle.paddingY}em`,
                paddingBottom: `${btnStyle.paddingY}em`,
                fontSize: `${btnStyle.fontSize / 10}cqw`,
                fontWeight: btnStyle.fontWeight,
              }}
            >
              {btnStyle.showIcon && <ShoppingCart style={{ width: '1em', height: '1em' }} />}
              {banner.button_text}
            </Link>
          ) : (
            <span
              className="inline-flex items-center gap-2 shadow-lg"
              style={{
                color: btnStyle.textColor,
                backgroundColor: hexToRgba(btnStyle.bgColor, btnStyle.bgOpacity),
                border: btnStyle.borderWidth > 0 ? `${btnStyle.borderWidth}px solid ${btnStyle.borderColor}` : 'none',
                borderRadius: `${btnStyle.borderRadius}px`,
                paddingLeft: `${btnStyle.paddingX}em`,
                paddingRight: `${btnStyle.paddingX}em`,
                paddingTop: `${btnStyle.paddingY}em`,
                paddingBottom: `${btnStyle.paddingY}em`,
                fontSize: `${btnStyle.fontSize / 10}cqw`,
                fontWeight: btnStyle.fontWeight,
              }}
            >
              {btnStyle.showIcon && <ShoppingCart style={{ width: '1em', height: '1em' }} />}
              {banner.button_text}
            </span>
          )}
        </div>
      )}

      {/* Navigation arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-[4] -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 active:scale-95"
            aria-label="Banner trước"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-[4] -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/50 hover:scale-110 active:scale-95"
            aria-label="Banner tiếp theo"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-[4] -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Chuyển đến banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// Helper: hex color + opacity → rgba string
function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.substring(0, 2), 16)
  const g = parseInt(clean.substring(2, 4), 16)
  const b = parseInt(clean.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${opacity})`
}
