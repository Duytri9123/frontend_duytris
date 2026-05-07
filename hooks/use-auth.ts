'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { login, logout, getUser, register } from '@/lib/auth'
import type { User, LoginCredentials, RegisterData } from '@/types'

// ── Singleton: chỉ fetch user 1 lần, chia sẻ giữa tất cả component ──────────
let _user: User | null = null
let _loading = true
let _fetched = false
const _listeners = new Set<() => void>()

function notify() { _listeners.forEach(fn => fn()) }

async function fetchUserOnce() {
  if (_fetched) return
  _fetched = true
  try {
    _user = await getUser()
  } catch {
    _user = null
  } finally {
    _loading = false
    notify()
  }
}

export function useAuth() {
  const [, forceUpdate] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1)
    _listeners.add(update)
    return () => { _listeners.delete(update) }
  }, [])

  useEffect(() => {
    fetchUserOnce()
  }, [])

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    const loggedInUser = await login(credentials)
    _user = loggedInUser
    _fetched = true
    _loading = false
    notify()
    document.cookie = `auth_user=1; path=/; max-age=86400`
    router.push('/')
    return loggedInUser
  }, [router])

  const handleLogout = useCallback(async () => {
    await logout()
    _user = null
    _fetched = false
    notify()
    document.cookie = 'auth_user=; path=/; max-age=0'
    router.push('/login')
  }, [router])

  const handleRegister = useCallback(async (data: RegisterData) => {
    const newUser = await register(data)
    _user = newUser
    _fetched = true
    _loading = false
    notify()
    document.cookie = `auth_user=1; path=/; max-age=86400`
    router.push('/')
    return newUser
  }, [router])

  return {
    user: _user,
    loading: _loading,
    isAuthenticated: !!_user,
    isAdmin: _user?.isAdmin ?? false,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
  }
}
