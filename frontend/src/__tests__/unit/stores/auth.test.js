import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'

// Mock API
vi.mock('@/services/api', () => ({
  authAPI: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn()
  }
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  describe('State', () => {
    it('should initialize with null user and token', () => {
      const store = useAuthStore()

      expect(store.user).toBeNull()
      expect(store.accessToken).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('Getters', () => {
    it('isAuthenticated should be false initially', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
    })

    it('isAuthenticated should be true when user and token exist', () => {
      const store = useAuthStore()
      store.accessToken = 'test_token'
      store.user = { id: 1, username: 'test', role: 'client' }

      expect(store.isAuthenticated).toBe(true)
    })

    it('isAdmin should return true for admin role', () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'admin', role: 'admin' }

      expect(store.isAdmin).toBe(true)
    })

    it('isAdmin should return false for client role', () => {
      const store = useAuthStore()
      store.user = { id: 1, username: 'user', role: 'client' }

      expect(store.isAdmin).toBe(false)
    })
  })

  describe('Actions - register', () => {
    it('should successfully register user', async () => {
      const store = useAuthStore()
      const userData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'Password123'
      }

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          user: { id: 1, ...userData }
        }
      }

      authAPI.register.mockResolvedValue(mockResponse)

      const result = await store.register(userData)

      expect(result.message).toBe('User registered successfully')
      expect(authAPI.register).toHaveBeenCalledWith(userData)
      expect(store.loading).toBe(false)
    })

    it('should handle registration error', async () => {
      const store = useAuthStore()
      const userData = { username: 'test' }

      authAPI.register.mockRejectedValue({
        response: { data: { message: 'User already exists' } }
      })

      await expect(store.register(userData)).rejects.toThrow()
      expect(store.error).toBe('User already exists')
      expect(store.loading).toBe(false)
    })
  })

  describe('Actions - login', () => {
    it('should successfully login and store tokens', async () => {
      const store = useAuthStore()
      const credentials = {
        username: 'testuser',
        password: 'Password123'
      }

      const mockResponse = {
        data: {
          message: 'Login successful',
          accessToken: 'test_access_token',
          user: { id: 1, username: 'testuser', role: 'client' }
        }
      }

      authAPI.login.mockResolvedValue(mockResponse)

      await store.login(credentials)

      expect(store.accessToken).toBe('test_access_token')
      expect(store.user.username).toBe('testuser')
      expect(sessionStorage.getItem('accessToken')).toBe('test_access_token')
      expect(store.loading).toBe(false)
    })

    it('should handle login error', async () => {
      const store = useAuthStore()

      authAPI.login.mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      })

      await expect(store.login({ username: 'test', password: 'wrong' })).rejects.toThrow()
      expect(store.error).toBe('Invalid credentials')
      expect(store.accessToken).toBeNull()
    })
  })

  describe('Actions - logout', () => {
    it('should clear user data on logout', async () => {
      const store = useAuthStore()
      
      // Set up logged in state
      store.accessToken = 'token'
      store.user = { id: 1, username: 'test' }
      sessionStorage.setItem('accessToken', 'token')
      sessionStorage.setItem('user', JSON.stringify({ id: 1 }))

      authAPI.logout.mockResolvedValue({})

      await store.logout()

      expect(store.accessToken).toBeNull()
      expect(store.user).toBeNull()
      expect(sessionStorage.getItem('accessToken')).toBeNull()
      expect(sessionStorage.getItem('user')).toBeNull()
    })
  })

  describe('Actions - forgotPassword', () => {
    it('should request password reset', async () => {
      const store = useAuthStore()
      const email = 'test@example.com'

      const mockResponse = {
        data: {
          message: 'Reset token sent',
          resetToken: 'test_token'
        }
      }

      authAPI.forgotPassword.mockResolvedValue(mockResponse)

      const result = await store.forgotPassword(email)

      expect(result.resetToken).toBe('test_token')
      expect(authAPI.forgotPassword).toHaveBeenCalledWith(email)
    })
  })

  describe('Actions - resetPassword', () => {
    it('should reset password with valid token', async () => {
      const store = useAuthStore()
      const resetData = {
        resetToken: 'valid_token',
        newPassword: 'NewPassword123'
      }

      const mockResponse = {
        data: {
          message: 'Password reset successfully'
        }
      }

      authAPI.resetPassword.mockResolvedValue(mockResponse)

      const result = await store.resetPassword(resetData)

      expect(result.message).toBe('Password reset successfully')
      expect(authAPI.resetPassword).toHaveBeenCalledWith(resetData)
    })
  })

  describe('initAuth', () => {
    it('should restore auth from sessionStorage', () => {
      const mockUser = { id: 1, username: 'test', role: 'client' }
      sessionStorage.setItem('accessToken', 'stored_token')
      sessionStorage.setItem('user', JSON.stringify(mockUser))

      const store = useAuthStore()
      store.initAuth()

      expect(store.accessToken).toBe('stored_token')
      expect(store.user).toEqual(mockUser)
    })

    it('should handle corrupted stored data gracefully', () => {
      sessionStorage.setItem('accessToken', 'token')
      sessionStorage.setItem('user', 'invalid-json')

      const store = useAuthStore()
      store.initAuth()

      expect(store.accessToken).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('clearError', () => {
    it('should clear error message', () => {
      const store = useAuthStore()
      store.error = 'Some error'

      store.clearError()

      expect(store.error).toBeNull()
    })
  })
})

