import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '@/components/ConfirmModal.vue'

describe('ConfirmModal Component', () => {
  it('should render when modelValue is true', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Test Title',
        message: 'Test message'
      }
    })

    expect(wrapper.find('.modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test message')
  })

  it('should not render when modelValue is false', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: false
      }
    })

    expect(wrapper.find('.modal').exists()).toBe(false)
  })

  it('should emit confirm event on confirm button click', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true
      }
    })

    await wrapper.findAll('button')[1].trigger('click')

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('should emit cancel event on cancel button click', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true
      }
    })

    await wrapper.find('button.btn-secondary').trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('should emit cancel on close button click', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true
      }
    })

    await wrapper.find('.btn-close').trigger('click')

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('should use custom button text', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        confirmText: 'Yes, delete',
        cancelText: 'No, keep it'
      }
    })

    expect(wrapper.text()).toContain('Yes, delete')
    expect(wrapper.text()).toContain('No, keep it')
  })

  it('should apply danger variant styling', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        variant: 'danger'
      }
    })

    expect(wrapper.find('.modal-header').classes()).toContain('bg-danger')
    expect(wrapper.find('.btn-danger').exists()).toBe(true)
  })

  it('should have proper ARIA attributes', () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Confirm Action'
      }
    })

    expect(wrapper.find('.modal').attributes('role')).toBe('dialog')
    expect(wrapper.find('.modal').attributes('aria-modal')).toBe('true')
    expect(wrapper.find('.modal').attributes('aria-labelledby')).toBe('confirmModalLabel')
    expect(wrapper.find('.btn-close').attributes('aria-label')).toBe('Close')
  })
})

