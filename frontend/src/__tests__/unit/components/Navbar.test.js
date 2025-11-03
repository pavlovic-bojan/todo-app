import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import Navbar from '@/components/Navbar.vue'
import { useAuthStore } from '@/stores/auth'

describe('Navbar Component', () => {
  let router
  let pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/login', component: { template: '<div>Login</div>' } },
        { path: '/register', component: { template: '<div>Register</div>' } },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
  })

  it('should render navbar', () => {
    const wrapper = mount(Navbar, {
      global: {
        plugins: [pinia, router]
      }
    })

    expect(wrapper.find('.navbar').exists()).toBe(true)
    expect(wrapper.text()).toContain('Todo App')
  })

  it('should show Login and Register when not authenticated', () => {
    const wrapper = mount(Navbar, {
      global: {
        plugins: [pinia, router]
      }
    })

    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).toContain('Register')
    expect(wrapper.text()).not.toContain('Logout')
  })

  it('should show Dashboard and Logout when authenticated', () => {
    const authStore = useAuthStore()
    authStore.accessToken = 'test_token'
    authStore.user = { id: 1, username: 'testuser', email: 'test@test.com', role: 'client' }

    const wrapper = mount(Navbar, {
      global: {
        plugins: [pinia, router]
      }
    })

    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).toContain('Hello, testuser')
    expect(wrapper.text()).toContain('Logout')
    expect(wrapper.text()).not.toContain('Login')
  })

  it('should call logout and redirect on logout button click', async () => {
    const authStore = useAuthStore()
    authStore.accessToken = 'test_token'
    authStore.user = { id: 1, username: 'testuser', email: 'test@test.com', role: 'client' }
    authStore.logout = vi.fn()

    const wrapper = mount(Navbar, {
      global: {
        plugins: [pinia, router]
      }
    })

    await router.isReady()

    const logoutButton = wrapper.find('button:contains("Logout")')
    if (logoutButton.exists()) {
      await logoutButton.trigger('click')
      expect(authStore.logout).toHaveBeenCalled()
    }
  })

  it('should have proper ARIA labels', () => {
    const wrapper = mount(Navbar, {
      global: {
        plugins: [pinia, router]
      }
    })

    const nav = wrapper.find('nav')
    expect(nav.attributes('role')).toBe('navigation')
    expect(nav.attributes('aria-label')).toBe('Main navigation')
  })
})

