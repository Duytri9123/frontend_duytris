'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          // Data được coi là "fresh" trong 10 phút — không refetch khi chuyển tab
          staleTime: 10 * 60 * 1000,
          // Giữ cache trong bộ nhớ 60 phút sau khi component unmount
          gcTime: 60 * 60 * 1000,
          retry: 1,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          refetchOnMount: false,
        },
      },
    })
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
