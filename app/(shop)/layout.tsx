'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { FloatingAiChat } from '@/components/ai/floating-ai-chat'
import { usePushNotifications } from '@/hooks/use-push-notifications'

function ShopInner({ children }: { children: React.ReactNode }) {
  usePushNotifications()
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingAiChat />
    </div>
  )
}

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <ShopInner>{children}</ShopInner>
}
