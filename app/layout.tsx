import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
import { SplashScreen } from "@/components/layout/splash-screen";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ecommerce Store",
    template: "%s | Ecommerce Store",
  },
  description: "Cửa hàng thương mại điện tử - Mua sắm trực tuyến dễ dàng",
};

// ── Fetch settings ở server — không cần chờ client-side API ──────────────────
interface SplashData {
  color:      string
  name:       string
  tagline:    string
  logoUrl:    string | null
  bgStyle:    string
  effect:     string
  enabled:    boolean
}

async function fetchSplashData(): Promise<SplashData> {
  const defaults: SplashData = {
    color:   '#6366f1',
    name:    'DT Shop',
    tagline: 'Mua sắm trực tuyến dễ dàng',
    logoUrl: null,
    bgStyle: 'gradient',
    effect:  'particles',
    enabled: true,
  }

  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    // next: { revalidate: 60 } — cache 60s, không block mỗi request
    const res = await fetch(`${API}/api/settings/flat`, {
      next: { revalidate: 60 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return defaults

    const json = await res.json()
    const s = json.data ?? {}

    const rawLogo = s.logo_url as string | null | undefined
    let logoUrl: string | null = null
    if (rawLogo) {
      logoUrl = rawLogo.startsWith('http') ? rawLogo : `${API}/${rawLogo.replace(/^\//, '')}`
    }

    return {
      color:   (s.primary_color  as string) || defaults.color,
      name:    (s.site_name      as string) || defaults.name,
      tagline: (s.splash_tagline as string) || (s.site_description as string) || defaults.tagline,
      logoUrl,
      bgStyle: (s.splash_bg_style as string) || defaults.bgStyle,
      effect:  (s.splash_effect   as string) || defaults.effect,
      enabled: s.splash_enabled !== '0',
    }
  } catch {
    return defaults
  }
}

// ── Tạo CSS inline với màu thực từ server ────────────────────────────────────
function buildSplashCSS(color: string, bgStyle: string): string {
  const bgMap: Record<string, string> = {
    gradient: `radial-gradient(ellipse 80% 60% at 20% 20%, ${color}18 0%, transparent 60%),
               radial-gradient(ellipse 60% 80% at 80% 80%, ${color}10 0%, transparent 60%), #fff`,
    white:    '#ffffff',
    dark:     'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    blur:     `linear-gradient(135deg, ${color}12 0%, #f8fafc 50%, ${color}08 100%)`,
  }
  const bg = bgMap[bgStyle] || bgMap.gradient
  const isDark = bgStyle === 'dark'
  const textColor = isDark ? '#f1f5f9' : '#0f172a'
  const subColor  = isDark ? '#94a3b8' : '#64748b'

  return `
    #splash-root {
      position:fixed; inset:0; z-index:9999;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      background:${bg}; overflow:hidden;
      transition: opacity 0.6s cubic-bezier(0.4,0,0.2,1),
                  transform 0.6s cubic-bezier(0.4,0,0.2,1);
    }
    #splash-root.splash-hiding { opacity:0; transform:scale(1.04); pointer-events:none; }

    .sp-bg { position:absolute; inset:0; background:${bg}; }

    .sp-grid {
      position:absolute; inset:0; pointer-events:none;
      background-image:
        linear-gradient(${color}06 1px, transparent 1px),
        linear-gradient(90deg, ${color}06 1px, transparent 1px);
      background-size:60px 60px;
      mask-image:radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 80%);
    }

    .sp-orb { position:absolute; border-radius:50%; filter:blur(60px); pointer-events:none; }
    .sp-orb1 {
      width:500px; height:500px; top:-180px; left:-180px;
      background:radial-gradient(circle, ${color}30, transparent 70%);
      animation:spOrbFloat1 8s ease-in-out infinite;
    }
    .sp-orb2 {
      width:400px; height:400px; bottom:-150px; right:-150px;
      background:radial-gradient(circle, ${color}20, transparent 70%);
      animation:spOrbFloat2 10s ease-in-out infinite;
    }
    .sp-orb3 {
      width:300px; height:300px; top:40%; left:60%;
      background:radial-gradient(circle, ${color}18, transparent 70%);
      animation:spOrbFloat3 7s ease-in-out infinite;
    }

    .sp-particles { position:absolute; inset:0; pointer-events:none; }
    .sp-particle  { position:absolute; border-radius:50%; background:${color}; }
    .sp-p1  { width:4px; height:4px; top:15%; left:10%; opacity:.4;  animation:spParticle 6s 0.0s ease-in-out infinite; }
    .sp-p2  { width:3px; height:3px; top:25%; left:85%; opacity:.3;  animation:spParticle 7s 0.5s ease-in-out infinite; }
    .sp-p3  { width:5px; height:5px; top:70%; left:15%; opacity:.35; animation:spParticle 5s 1.0s ease-in-out infinite; }
    .sp-p4  { width:3px; height:3px; top:80%; left:75%; opacity:.3;  animation:spParticle 8s 1.5s ease-in-out infinite; }
    .sp-p5  { width:4px; height:4px; top:10%; left:50%; opacity:.25; animation:spParticle 6s 2.0s ease-in-out infinite; }
    .sp-p6  { width:6px; height:6px; top:55%; left:90%; opacity:.2;  animation:spParticle 9s 0.8s ease-in-out infinite; }
    .sp-p7  { width:3px; height:3px; top:40%; left:5%;  opacity:.3;  animation:spParticle 7s 1.2s ease-in-out infinite; }
    .sp-p8  { width:4px; height:4px; top:90%; left:40%; opacity:.25; animation:spParticle 5s 2.5s ease-in-out infinite; }
    .sp-p9  { width:5px; height:5px; top:5%;  left:70%; opacity:.3;  animation:spParticle 8s 0.3s ease-in-out infinite; }
    .sp-p10 { width:3px; height:3px; top:60%; left:55%; opacity:.2;  animation:spParticle 6s 1.8s ease-in-out infinite; }

    .sp-inner {
      position:relative; z-index:1;
      display:flex; flex-direction:column; align-items:center; gap:0;
    }
    .sp-logo-wrap {
      position:relative; margin-bottom:24px;
      animation:spLogoIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    .sp-ring {
      position:absolute; border-radius:50%;
      border:1.5px solid ${color};
      top:50%; left:50%; transform:translate(-50%,-50%);
      pointer-events:none;
    }
    .sp-ring1 { width:110px; height:110px; opacity:.25; animation:spRing 2.4s 0.2s ease-out infinite; }
    .sp-ring2 { width:140px; height:140px; opacity:.15; animation:spRing 2.4s 0.7s ease-out infinite; }
    .sp-ring3 { width:170px; height:170px; opacity:.08; animation:spRing 2.4s 1.2s ease-out infinite; }

    .sp-icon {
      width:88px; height:88px; border-radius:22px;
      background:linear-gradient(135deg, ${color}, ${color}cc);
      color:#fff; display:flex; align-items:center; justify-content:center;
      font-size:36px; font-weight:900; font-family:sans-serif;
      box-shadow:0 24px 64px ${color}45, 0 0 0 1px ${color}15;
      position:relative; overflow:hidden;
    }
    .sp-icon::after {
      content:''; position:absolute; inset:0;
      background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,.35) 50%, transparent 60%);
      animation:spShimmer 2.5s 0.8s ease-in-out infinite;
    }
    .sp-logo-img {
      width:88px; height:88px; border-radius:22px; object-fit:contain;
      box-shadow:0 24px 64px ${color}30, 0 0 0 1px ${color}10;
      background:#fff; padding:8px; display:none;
    }

    .sp-name {
      font-size:30px; font-weight:900; color:${textColor};
      font-family:sans-serif; letter-spacing:-.5px;
      animation:spUp 0.55s 0.18s ease-out both;
    }
    .sp-desc {
      font-size:13px; color:${subColor}; font-family:sans-serif;
      margin-top:6px; animation:spUp 0.55s 0.28s ease-out both;
    }
    .sp-bar-wrap {
      width:140px; height:3px; border-radius:99px;
      background:#e2e8f0; overflow:hidden; margin-top:28px;
      animation:spUp 0.55s 0.38s ease-out both;
    }
    .sp-bar {
      height:100%; border-radius:99px;
      background:linear-gradient(90deg, ${color}, ${color}bb, ${color}88);
      background-size:200% 100%;
      animation:spBarFill 2.8s ease-in-out both, spBarShine 1.8s 0.5s ease-in-out infinite;
    }
    .sp-dots { display:flex; gap:6px; margin-top:14px; animation:spUp 0.55s 0.45s ease-out both; }
    .sp-dot  { width:5px; height:5px; border-radius:50%; background:${color}; }
    .sp-dot:nth-child(1) { animation:spDot 1.4s 0.0s ease-in-out infinite; }
    .sp-dot:nth-child(2) { animation:spDot 1.4s 0.2s ease-in-out infinite; }
    .sp-dot:nth-child(3) { animation:spDot 1.4s 0.4s ease-in-out infinite; }

    @keyframes spLogoIn  { from{opacity:0;transform:scale(.5) rotate(-8deg)} to{opacity:1;transform:scale(1) rotate(0)} }
    @keyframes spUp      { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
    @keyframes spRing    { 0%{transform:translate(-50%,-50%) scale(.85);opacity:.5} 100%{transform:translate(-50%,-50%) scale(1.6);opacity:0} }
    @keyframes spShimmer { 0%{transform:translateX(-100%) skewX(-15deg)} 60%,100%{transform:translateX(200%) skewX(-15deg)} }
    @keyframes spBarFill { 0%{width:0%} 50%{width:70%} 100%{width:92%} }
    @keyframes spBarShine{ 0%,100%{background-position:200% 0} 50%{background-position:-200% 0} }
    @keyframes spDot     { 0%,80%,100%{transform:scale(.6);opacity:.35} 40%{transform:scale(1.3);opacity:1} }
    @keyframes spParticle{ 0%,100%{transform:translateY(0) scale(1);opacity:.3} 50%{transform:translateY(-20px) scale(1.4);opacity:.6} }
    @keyframes spOrbFloat1{ 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,20px)} }
    @keyframes spOrbFloat2{ 0%,100%{transform:translate(0,0)} 50%{transform:translate(-25px,-15px)} }
    @keyframes spOrbFloat3{ 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,25px)} }
  `
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch settings ở server — màu/tên/logo có ngay trong HTML đầu tiên
  const splash = await fetchSplashData()
  const splashCSS = buildSplashCSS(splash.color, splash.bgStyle)

  // Chữ cái đầu tên shop
  const initial = splash.name[0]?.toUpperCase() ?? 'D'

  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* ── Splash CSS với màu/nền thực từ server ── */}
        <style dangerouslySetInnerHTML={{ __html: splashCSS }} />

        {/* ── Splash HTML với dữ liệu thực từ server ── */}
        {splash.enabled && (
          <div id="splash-root" suppressHydrationWarning>
            <div className="sp-bg" />
            <div className="sp-grid" />
            <div className="sp-orb sp-orb1" />
            <div className="sp-orb sp-orb2" />
            <div className="sp-orb sp-orb3" />
            <div className="sp-particles">
              <div className="sp-particle sp-p1" /><div className="sp-particle sp-p2" />
              <div className="sp-particle sp-p3" /><div className="sp-particle sp-p4" />
              <div className="sp-particle sp-p5" /><div className="sp-particle sp-p6" />
              <div className="sp-particle sp-p7" /><div className="sp-particle sp-p8" />
              <div className="sp-particle sp-p9" /><div className="sp-particle sp-p10" />
            </div>
            <div className="sp-inner">
              <div className="sp-logo-wrap">
                <div className="sp-ring sp-ring1" />
                <div className="sp-ring sp-ring2" />
                <div className="sp-ring sp-ring3" />
                {/* Icon chữ cái — luôn hiện trước, ẩn khi logo load xong */}
                <div id="sp-icon" className="sp-icon">{initial}</div>
                {/* Logo img — ẩn ban đầu, JS hiện khi load xong */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="sp-logo-img"
                  className="sp-logo-img"
                  src={splash.logoUrl ?? ''}
                  alt={splash.name}
                />
              </div>
              <div className="sp-name" id="sp-name">{splash.name}</div>
              <div className="sp-desc" id="sp-desc">{splash.tagline}</div>
              <div className="sp-bar-wrap">
                <div className="sp-bar" />
              </div>
              <div className="sp-dots">
                <div className="sp-dot" /><div className="sp-dot" /><div className="sp-dot" />
              </div>
            </div>
          </div>
        )}

        <Providers>
          <SplashScreen splashEnabled={splash.enabled} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
