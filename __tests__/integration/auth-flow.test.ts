/**
 * Integration tests: Authentication flows
 * Tests login, logout, register, and protected route behavior
 * using MSW to mock the Laravel Sanctum backend.
 *
 * Validates: Requirements 9.2.2 (Integration tests with MSW)
 */
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import { login, logout, register, getUser } from '@/lib/auth'
import { mockUser, mockAdmin } from './mocks/handlers'

const API_BASE = 'http://localhost:8000'

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Authentication Flow Integration', () => {
  describe('login()', () => {
    it('returns user data on successful login', async () => {
      const user = await login({ email: 'user@example.com', password: 'password123' })

      expect(user.id).toBe(mockUser.id)
      expect(user.email).toBe(mockUser.email)
      expect(user.isAdmin).toBe(false)
    })

    it('returns admin user with isAdmin=true', async () => {
      const user = await login({ email: 'admin@example.com', password: 'admin123' })

      expect(user.isAdmin).toBe(true)
      expect(user.email).toBe(mockAdmin.email)
    })

    it('throws on invalid credentials', async () => {
      await expect(
        login({ email: 'wrong@example.com', password: 'wrongpass' })
      ).rejects.toThrow()
    })

    it('requests CSRF cookie before posting login', async () => {
      let csrfRequested = false
      server.use(
        http.get(`${API_BASE}/sanctum/csrf-cookie`, () => {
          csrfRequested = true
          return new HttpResponse(null, { status: 204 })
        })
      )

      await login({ email: 'user@example.com', password: 'password123' })
      expect(csrfRequested).toBe(true)
    })
  })

  describe('logout()', () => {
    it('calls POST /logout successfully', async () => {
      let logoutCalled = false
      server.use(
        http.post(`${API_BASE}/logout`, () => {
          logoutCalled = true
          return new HttpResponse(null, { status: 204 })
        })
      )

      await logout()
      expect(logoutCalled).toBe(true)
    })
  })

  describe('register()', () => {
    it('creates a new user and returns user data', async () => {
      const newUser = await register({
        name: 'Tran Thi B',
        email: 'newuser@example.com',
        password: 'password123',
        password_confirmation: 'password123',
      })

      expect(newUser.name).toBe('Tran Thi B')
      expect(newUser.email).toBe('newuser@example.com')
    })

    it('requests CSRF cookie before posting register', async () => {
      let csrfRequested = false
      server.use(
        http.get(`${API_BASE}/sanctum/csrf-cookie`, () => {
          csrfRequested = true
          return new HttpResponse(null, { status: 204 })
        })
      )

      await register({
        name: 'Test',
        email: 'test2@example.com',
        password: 'pass',
        password_confirmation: 'pass',
      })
      expect(csrfRequested).toBe(true)
    })
  })

  describe('getUser()', () => {
    it('returns user when authenticated', async () => {
      const user = await getUser()
      expect(user).not.toBeNull()
      expect(user?.email).toBe(mockUser.email)
    })

    it('returns null when 401 Unauthorized', async () => {
      server.use(
        http.get(`${API_BASE}/api/user`, () => {
          return HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
        })
      )

      const user = await getUser()
      expect(user).toBeNull()
    })

    it('returns null on network error', async () => {
      server.use(
        http.get(`${API_BASE}/api/user`, () => {
          return HttpResponse.error()
        })
      )

      const user = await getUser()
      expect(user).toBeNull()
    })
  })

  describe('Protected route behavior', () => {
    it('getUser returns null for unauthenticated session', async () => {
      server.use(
        http.get(`${API_BASE}/api/user`, () => {
          return HttpResponse.json({ message: 'Unauthenticated.' }, { status: 401 })
        })
      )

      const user = await getUser()
      expect(user).toBeNull()
    })

    it('full login → getUser flow returns consistent user', async () => {
      // Login first
      const loggedInUser = await login({ email: 'user@example.com', password: 'password123' })

      // Then getUser should return same user (session cookie handled by browser)
      const currentUser = await getUser()

      expect(loggedInUser.id).toBe(currentUser?.id)
      expect(loggedInUser.email).toBe(currentUser?.email)
    })
  })
})
