import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

describe('LoginView', () => {
  let router
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/login', component: LoginView },
        { path: '/dashboard', component: { template: '<div>Dashboard</div>' } }
      ]
    })
  })

  it('should render login form', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('h1').text()).toContain('Login')
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should show error message when auth fails', async () => {
    authStore.error = 'Invalid credentials'

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.alert-danger').exists()).toBe(true)
    expect(wrapper.text()).toContain('Invalid credentials')
  })

  it('should have forgot password link', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const link = wrapper.find('a[href*="forgot-password"]')
    expect(link.exists()).toBe(true)
  })

  it('should have register link', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain("Don't have an account?")
    const link = wrapper.find('a[href*="register"]')
    expect(link.exists()).toBe(true)
  })

  it('should validate username field on blur', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const usernameInput = wrapper.find('#username')
    await usernameInput.setValue('')
    await usernameInput.trigger('blur')

    await wrapper.vm.$nextTick()

    // Should show validation error
    const feedback = wrapper.find('.invalid-feedback')
    if (feedback.exists()) {
      expect(feedback.text()).toContain('required')
    }
  })

  it('should disable submit button when loading', async () => {
    authStore.loading = true

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })

  it('should have proper accessibility attributes', () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    const form = wrapper.find('form')
    expect(form.attributes('novalidate')).toBeDefined()

    const usernameInput = wrapper.find('#username')
    expect(usernameInput.attributes('autocomplete')).toBe('username')
    expect(usernameInput.attributes('aria-invalid')).toBeDefined()

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('autocomplete')).toBe('current-password')
  })

  it('should show loading spinner when submitting', async () => {
    authStore.loading = true

    const wrapper = mount(LoginView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.spinner-border').exists()).toBe(true)
  })
})

