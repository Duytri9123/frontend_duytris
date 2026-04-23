import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'
import * as authLib from '@/lib/auth'
import type { User } from '@/types'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock auth lib
jest.mock('@/lib/auth', () => ({
  getUser: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
}))

const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  isAdmin: false,
  email_verified_at: null,
  created_at: '2024-01-01',
}

const mockAdmin: User = { ...mockUser, id: 2, isAdmin: true }

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: no user logged in
    ;(authLib.getUser as jest.Mock).mockResolvedValue(null)
  })

  it('starts with loading=true', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.loading).toBe(true)
  })

  it('sets user after getUser resolves', async () => {
    ;(authLib.getUser as jest.Mock).mockResolvedValue(mockUser)
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isAdmin).toBe(false)
  })

  it('isAdmin is true for admin user', async () => {
    ;(authLib.getUser as jest.Mock).mockResolvedValue(mockAdmin)
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isAdmin).toBe(true)
  })

  it('isAuthenticated is false when no user', async () => {
    const { result } = renderHook(() => useAuth())

    await waitFor(() => expect(result.current.loading).toBe(false))

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('login sets user and redirects', async () => {
    const { useRouter } = require('next/navigation')
    const mockPush = jest.fn()
    useRouter.mockReturnValue({ push: mockPush })
    ;(authLib.login as jest.Mock).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'password' })
    })

    expect(result.current.user).toEqual(mockUser)
    expect(mockPush).toHaveBeenCalledWith('/')
  })

  it('logout clears user and redirects to login', async () => {
    const { useRouter } = require('next/navigation')
    const mockPush = jest.fn()
    useRouter.mockReturnValue({ push: mockPush })
    ;(authLib.getUser as jest.Mock).mockResolvedValue(mockUser)
    ;(authLib.logout as jest.Mock).mockResolvedValue(undefined)

    const { result } = renderHook(() => useAuth())
    await waitFor(() => expect(result.current.loading).toBe(false))

    await act(async () => {
      await result.current.logout()
    })

    expect(result.current.user).toBeNull()
    expect(mockPush).toHaveBeenCalledWith('/login')
  })
})
