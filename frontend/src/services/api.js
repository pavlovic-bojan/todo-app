import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important: Send cookies with requests
})

let isRefreshing = false
let failedQueue = []
let lastRefreshTime = 0
const REFRESH_COOLDOWN = 5000 // 5 seconds cooldown between refresh attempts

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Check if we're already refreshing or if we recently tried to refresh
      const now = Date.now()
      if (isRefreshing || (now - lastRefreshTime < REFRESH_COOLDOWN)) {
        // If already refreshing or in cooldown, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      // Don't retry if this is already a refresh request to avoid infinite loop
      if (originalRequest.url?.includes('/users/refresh')) {
        // Refresh failed - logout user
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('user')
        
        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        return Promise.reject(error)
      }

      originalRequest._retry = true
      isRefreshing = true
      lastRefreshTime = now

      try {
        // Try to refresh the token
        const response = await api.post('/users/refresh')
        const { accessToken } = response.data
        
        // Store new access token
        sessionStorage.setItem('accessToken', accessToken)
        
        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        
        // Process queued requests
        processQueue(null, accessToken)
        isRefreshing = false
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - logout user
        processQueue(refreshError, null)
        isRefreshing = false
        
        // Clear tokens
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('user')
        
        // Redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        
        return Promise.reject(refreshError)
      }
    }

    // Handle rate limiting (429) errors
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      const message = error.response.data?.message || 'Too many requests. Please try again later.'
      const errorWithRetry = new Error(message)
      errorWithRetry.retryAfter = retryAfter
      errorWithRetry.status = 429
      return Promise.reject(errorWithRetry)
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  register(data) {
    return api.post('/users/register', data)
  },
  login(data) {
    return api.post('/users/login', data)
  },
  logout() {
    return api.post('/users/logout')
  },
  refreshToken() {
    return api.post('/users/refresh')
  },
  forgotPassword(email) {
    return api.post('/users/forgot-password', { email })
  },
  resetPassword(data) {
    return api.post('/users/reset-password', data)
  }
}

// Todo API
export const todoAPI = {
  getAll(params) {
    return api.get('/todos', { params })
  },
  getById(id) {
    return api.get(`/todos/${id}`)
  },
  create(data) {
    return api.post('/todos', data)
  },
  update(id, data) {
    return api.patch(`/todos/${id}`, data)
  },
  delete(id) {
    return api.delete(`/todos/${id}`)
  },
  toggle(id) {
    return api.patch(`/todos/${id}/toggle`)
  }
}

// User API
export const userAPI = {
  getProfile(id) {
    return api.get(`/users/${id}`)
  },
  updateProfile(id, data) {
    return api.patch(`/users/${id}`, data)
  }
}

export default api
