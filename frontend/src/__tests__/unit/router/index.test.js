import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'

// Import router configuration
const createTestRouter = () => {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        redirect: '/dashboard'
      },
      {
        path: '/login',
        name: 'login',
        component: { template: '<div>Login</div>' },
        meta: { requiresGuest: true }
      },
      {
        path: '/register',
        name: 'register',
        component: { template: '<div>Register</div>' },
        meta: { requiresGuest: true }
      },
      {
        path: '/dashboard',
        name: 'dashboard',
        component: { template: '<div>Dashboard</div>' },
        meta: { requiresAuth: true }
      }
    ]
  })
}

describe('Vue Router', () => {
  let router
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    router = createTestRouter()

    // Add navigation guard
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login')
      } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
        next('/dashboard')
      } else {
        next()
      }
    })
  })

  describe('Route Definitions', () => {
    it('should have all required routes', () => {
      const routes = router.getRoutes()
      const routeNames = routes.map(r => r.name)

      expect(routeNames).toContain('login')
      expect(routeNames).toContain('register')
      expect(routeNames).toContain('dashboard')
    })

    it('should redirect root to dashboard', async () => {
      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/')
    })
  })

  describe('Navigation Guards - requiresAuth', () => {
    it('should redirect to login when accessing protected route without auth', async () => {
      authStore.accessToken = null
      authStore.user = null

      await router.push('/dashboard')

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should allow access to protected route when authenticated', async () => {
      authStore.accessToken = 'test_token'
      authStore.user = { id: 1, username: 'test', role: 'client' }

      await router.push('/dashboard')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })
  })

  describe('Navigation Guards - requiresGuest', () => {
    it('should allow access to guest routes when not authenticated', async () => {
      authStore.accessToken = null
      authStore.user = null

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('should redirect to dashboard when accessing guest route while authenticated', async () => {
      authStore.accessToken = 'test_token'
      authStore.user = { id: 1, username: 'test', role: 'client' }

      await router.push('/login')

      expect(router.currentRoute.value.path).toBe('/dashboard')
    })
  })

  describe('Meta Fields', () => {
    it('should have requiresAuth meta on protected routes', () => {
      const dashboardRoute = router.getRoutes().find(r => r.name === 'dashboard')
      expect(dashboardRoute.meta.requiresAuth).toBe(true)
    })

    it('should have requiresGuest meta on auth routes', () => {
      const loginRoute = router.getRoutes().find(r => r.name === 'login')
      expect(loginRoute.meta.requiresGuest).toBe(true)
    })
  })
})

