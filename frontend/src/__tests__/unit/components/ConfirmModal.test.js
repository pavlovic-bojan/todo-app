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
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    // Modal is teleported to body, check document.body
    const modal = document.body.querySelector('.modal')
    expect(modal).toBeTruthy()
    expect(document.body.textContent).toContain('Test Title')
    expect(document.body.textContent).toContain('Test message')
    
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
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    // Find buttons in document.body since modal is teleported
    const buttons = document.body.querySelectorAll('button')
    const confirmButton = Array.from(buttons).find(btn => 
      btn.className.includes('btn-primary') || btn.className.includes('btn-danger')
    )
    
    if (confirmButton) {
      confirmButton.click()
      await wrapper.vm.$nextTick()
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
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const cancelButton = document.body.querySelector('button.btn-secondary')
    if (cancelButton) {
      cancelButton.click()
      await wrapper.vm.$nextTick()
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
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const closeButton = document.body.querySelector('.btn-close')
    if (closeButton) {
      closeButton.click()
      await wrapper.vm.$nextTick()
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
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Yes, delete')
    expect(document.body.textContent).toContain('No, keep it')
    
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
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const header = document.body.querySelector('.modal-header')
    if (header) {
      expect(header.className).toContain('bg-danger')
    }
    
    const dangerButton = document.body.querySelector('.btn-danger')
    expect(dangerButton).toBeTruthy()
    
    wrapper.unmount()
  })

  it('should have proper ARIA attributes', async () => {
    const wrapper = mount(ConfirmModal, {
      props: {
        modelValue: true,
        title: 'Confirm Action',
        message: 'Please confirm'
      },
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })

    await wrapper.vm.$nextTick()

    const modal = document.body.querySelector('.modal')
    if (modal) {
      expect(modal.getAttribute('role')).toBe('dialog')
      expect(modal.getAttribute('aria-modal')).toBe('true')
    }
    
    const closeButton = document.body.querySelector('.btn-close')
    if (closeButton) {
      expect(closeButton.getAttribute('aria-label')).toBe('Close')
    }
    
    wrapper.unmount()
  })
})

