import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const accessToken = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!accessToken.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Actions
  function initAuth() {
    // Only restore from sessionStorage (not localStorage for security)
    const storedToken = sessionStorage.getItem('accessToken')
    const storedUser = sessionStorage.getItem('user')
    
    if (storedToken && storedUser) {
      try {
        accessToken.value = storedToken
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('Failed to parse stored user data:', err)
        clearAuth()
      }
    }
  }

  function clearAuth() {
    accessToken.value = null
    user.value = null
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('user')
  }

  async function register(userData) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.register(userData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.login(credentials)
      const { accessToken: token, user: userData } = response.data
      
      // Store access token (refresh token is in httpOnly cookie)
      accessToken.value = token
      user.value = userData
      
      // Store in sessionStorage (more secure than localStorage)
      sessionStorage.setItem('accessToken', token)
      sessionStorage.setItem('user', JSON.stringify(userData))
      
      return response.data
    } catch (err) {
      // Handle rate limiting errors with better message
      if (err.status === 429 || err.response?.status === 429) {
        const retryAfter = err.retryAfter || err.response?.headers['retry-after']
        if (retryAfter) {
          error.value = `Too many login attempts. Please try again in ${retryAfter} seconds.`
        } else {
          error.value = 'Too many login attempts. Please wait a few minutes before trying again.'
        }
      } else {
        error.value = err.response?.data?.message || err.message || 'Login failed'
      }
      clearAuth()
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      clearAuth()
      loading.value = false
    }
  }

  async function forgotPassword(email) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.forgotPassword(email)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Request failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(data) {
    loading.value = true
    error.value = null
    try {
      const response = await authAPI.resetPassword(data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Reset failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    initAuth,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    clearError
  }
})
