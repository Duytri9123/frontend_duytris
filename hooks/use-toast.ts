'use client'

import { useState, useCallback } from 'react'

export type ToastVariant = 'default' | 'destructive' | 'success'

interface ToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

interface Toast extends ToastProps {
  id: string
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).slice(2)
    const duration = props.duration ?? 3000
    
    setToasts(prev => [...prev, { ...props, id }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toast, toasts, dismiss }
}
