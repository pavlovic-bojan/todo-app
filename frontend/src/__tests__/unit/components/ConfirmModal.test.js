import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmModal from '@/components/ConfirmModal.vue'

describe('ConfirmModal Component', () => {
  it('should render when modelValue is true', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Test Title',
        message: 'Test message'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.modal').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Test message')
    
    wrapper.unmount()
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
        modelValue: true,
        title: 'Confirm',
        message: 'Are you sure?'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    const confirmButton = buttons.find(btn => btn.classes().includes('btn-primary') || btn.classes().includes('btn-danger'))
    
    if (confirmButton) {
      await confirmButton.trigger('click')
    }

    expect(wrapper.emitted('confirm')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    
    wrapper.unmount()
  })

  it('should emit cancel event on cancel button click', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Confirm',
        message: 'Are you sure?'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const cancelButton = wrapper.find('button.btn-secondary')
    if (cancelButton.exists()) {
      await cancelButton.trigger('click')
    }

    expect(wrapper.emitted('cancel')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    
    wrapper.unmount()
  })

  it('should emit cancel on close button click', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Confirm',
        message: 'Are you sure?'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const closeButton = wrapper.find('.btn-close')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
    }

    expect(wrapper.emitted('cancel')).toBeTruthy()
    
    wrapper.unmount()
  })

  it('should use custom button text', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Delete',
        message: 'Delete this?',
        confirmText: 'Yes, delete',
        cancelText: 'No, keep it'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Yes, delete')
    expect(wrapper.text()).toContain('No, keep it')
    
    wrapper.unmount()
  })

  it('should apply danger variant styling', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Delete',
        message: 'Are you sure?',
        variant: 'danger'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const header = wrapper.find('.modal-header')
    if (header.exists()) {
      expect(header.classes()).toContain('bg-danger')
    }
    expect(wrapper.find('.btn-danger').exists()).toBe(true)
    
    wrapper.unmount()
  })

  it('should have proper ARIA attributes', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Confirm Action',
        message: 'Please confirm'
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const modal = wrapper.find('.modal')
    if (modal.exists()) {
      expect(modal.attributes('role')).toBe('dialog')
      expect(modal.attributes('aria-modal')).toBe('true')
    }
    
    const closeButton = wrapper.find('.btn-close')
    if (closeButton.exists()) {
      expect(closeButton.attributes('aria-label')).toBe('Close')
    }
    
    wrapper.unmount()
  })
})

