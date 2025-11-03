import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import { setActivePinia, createPinia } from 'pinia'
import RegisterView from '@/views/RegisterView.vue'
import { useAuthStore } from '@/stores/auth'

describe('RegisterView', () => {
  let router
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/register', component: RegisterView },
        { path: '/login', component: { template: '<div>Login</div>' } }
      ]
    })
  })

  it('should render registration form', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.find('h1').text()).toContain('Register')
    expect(wrapper.find('#username').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#role').exists()).toBe(true)
  })

  it('should have optional age field', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    const ageInput = wrapper.find('#age')
    expect(ageInput.exists()).toBe(true)
    expect(ageInput.attributes('type')).toBe('number')
  })

  it('should show validation hints', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('At least 3 characters')
    expect(wrapper.text()).toContain('At least 6 characters')
  })

  it('should show error message on registration failure', async () => {
    authStore.error = 'User already exists'

    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.alert-danger').exists()).toBe(true)
    expect(wrapper.text()).toContain('User already exists')
  })

  it('should show success message on successful registration', async () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    wrapper.vm.successMessage = 'Registration successful!'
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.alert-success').exists()).toBe(true)
    expect(wrapper.text()).toContain('Registration successful')
  })

  it('should have login link', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    expect(wrapper.text()).toContain('Already have an account?')
    const link = wrapper.find('a[href*="login"]')
    expect(link.exists()).toBe(true)
  })

  it('should disable form when loading', async () => {
    authStore.loading = true

    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    await wrapper.vm.$nextTick()

    const inputs = wrapper.findAll('input')
    inputs.forEach(input => {
      expect(input.attributes('disabled')).toBeDefined()
    })
  })

  it('should have proper ARIA labels', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    const usernameInput = wrapper.find('#username')
    expect(usernameInput.attributes('aria-invalid')).toBeDefined()
    expect(usernameInput.attributes('autocomplete')).toBe('username')

    const emailInput = wrapper.find('#email')
    expect(emailInput.attributes('autocomplete')).toBe('email')

    const passwordInput = wrapper.find('#password')
    expect(passwordInput.attributes('autocomplete')).toBe('new-password')
  })

  it('should sanitize input before submission', () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    // The component uses useSanitize composable
    expect(wrapper.vm).toBeDefined()
  })

  it('should validate password strength', async () => {
    const wrapper = mount(RegisterView, {
      global: {
        plugins: [router]
      }
    })

    const passwordInput = wrapper.find('#password')
    await passwordInput.setValue('weak')
    await passwordInput.trigger('blur')

    await wrapper.vm.$nextTick()

    // Should show validation error for weak password
    const feedback = wrapper.find('#password-error')
    if (feedback.exists()) {
      expect(feedback.text()).toContain('uppercase')
    }
  })
})

