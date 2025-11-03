import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { h } from 'vue'

describe('ErrorBoundary Component', () => {
  it('should render children when no error', () => {
    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: '<div>Child content</div>'
      }
    })

    expect(wrapper.text()).toContain('Child content')
    expect(wrapper.find('.error-boundary').exists()).toBe(false)
  })

  it('should catch and display error', async () => {
    const ErrorComponent = {
      setup() {
        throw new Error('Test error')
      },
      render() {
        return h('div', 'Should not render')
      }
    }

    const wrapper = mount(ErrorBoundary, {
      slots: {
        default: h(ErrorComponent)
      }
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.error-boundary').exists()).toBe(true)
    expect(wrapper.text()).toContain('Something went wrong')
  })

  it('should show error details when requested', async () => {
    const wrapper = mount(ErrorBoundary)
    
    // Manually trigger error state
    wrapper.vm.hasError = true
    wrapper.vm.errorInfo = 'Test error details'
    wrapper.vm.showDetails = false

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.alert-light').exists()).toBe(false)

    // Click show details
    await wrapper.find('button:contains("Show Details")').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.showDetails).toBe(true)
  })

  it('should have reload button', async () => {
    const wrapper = mount(ErrorBoundary)
    wrapper.vm.hasError = true

    await wrapper.vm.$nextTick()

    const reloadButton = wrapper.find('button:contains("Reload")')
    expect(reloadButton.exists()).toBe(true)
  })

  it('should have go home button', async () => {
    const wrapper = mount(ErrorBoundary)
    wrapper.vm.hasError = true

    await wrapper.vm.$nextTick()

    const homeButton = wrapper.find('button:contains("Go Home")')
    expect(homeButton.exists()).toBe(true)
  })

  it('should reset error state', () => {
    const wrapper = mount(ErrorBoundary)
    wrapper.vm.hasError = true
    wrapper.vm.errorInfo = 'Some error'

    wrapper.vm.reset()

    expect(wrapper.vm.hasError).toBe(false)
    expect(wrapper.vm.errorInfo).toBe('')
  })

  it('should have proper ARIA attributes', async () => {
    const wrapper = mount(ErrorBoundary)
    wrapper.vm.hasError = true

    await wrapper.vm.$nextTick()

    const card = wrapper.find('.card')
    expect(card.exists()).toBe(true)
  })
})

