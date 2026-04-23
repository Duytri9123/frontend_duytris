// hooks/use-auth.ts
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { login, logout, getUser, register } from '@/lib/auth'
import type { User, LoginCredentials, RegisterData } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    getUser().then(u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    const user = await login(credentials)
    setUser(user)
    // Set cookie cho middleware
    document.cookie = `auth_user=1; path=/; max-age=86400`
    router.push('/')
    return user
  }, [router])

  const handleLogout = useCallback(async () => {
    await logout()
    setUser(null)
    document.cookie = 'auth_user=; path=/; max-age=0'
    router.push('/login')
  }, [router])

  const handleRegister = useCallback(async (data: RegisterData) => {
    const user = await register(data)
    setUser(user)
    document.cookie = `auth_user=1; path=/; max-age=86400`
    router.push('/')
    return user
  }, [router])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin ?? false,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  }
}