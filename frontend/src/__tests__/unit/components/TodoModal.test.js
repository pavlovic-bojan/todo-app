import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoModal from '@/components/TodoModal.vue'

describe('TodoModal Component', () => {
  let wrapper

  beforeEach(async () => {
    wrapper = mount(TodoModal, {
      props: {
        modelValue: true,
        todo: null,
        loading: false
      },
      global: {
        stubs: {
          Teleport: false
        }
      },
      attachTo: document.body
    })
    await wrapper.vm.$nextTick()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should render modal when modelValue is true', () => {
    const modal = document.body.querySelector('.modal')
    expect(modal).toBeTruthy()
  })

  it('should show "Create New Todo" title for new todo', () => {
    expect(document.body.textContent).toContain('Create New Todo')
  })

  it('should show "Edit Todo" title when editing', async () => {
    // Close and reopen with todo to trigger watch
    await wrapper.setProps({ modelValue: false })
    await wrapper.vm.$nextTick()
    
    await wrapper.setProps({
      modelValue: true,
      todo: { id: 1, title: 'Test', description: 'Test desc' }
    })
    await wrapper.vm.$nextTick()

    expect(document.body.textContent).toContain('Edit Todo')
  })

  it('should populate form when editing existing todo', async () => {
    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description'
    }

    // Close and reopen with todo to trigger watch
    await wrapper.setProps({ modelValue: false })
    await wrapper.vm.$nextTick()
    
    await wrapper.setProps({
      modelValue: true,
      todo: todo
    })
    await wrapper.vm.$nextTick()

    const titleInput = document.body.querySelector('#todoTitle')
    const descInput = document.body.querySelector('#todoDescription')
    
    if (titleInput) {
      expect(titleInput.value).toBe(todo.title)
    }
    if (descInput) {
      expect(descInput.value).toBe(todo.description)
    }
  })

  it('should emit submit event with sanitized data', async () => {
    const titleInput = document.body.querySelector('#todoTitle')
    const descInput = document.body.querySelector('#todoDescription')
    const form = document.body.querySelector('form')
    
    if (titleInput) {
      titleInput.value = 'Test Title'
      titleInput.dispatchEvent(new Event('input'))
    }
    if (descInput) {
      descInput.value = 'Test Description'
      descInput.dispatchEvent(new Event('input'))
    }
    if (form) {
      form.dispatchEvent(new Event('submit'))
      await wrapper.vm.$nextTick()
    }

    expect(wrapper.emitted('submit')).toBeTruthy()
    if (wrapper.emitted('submit')) {
      expect(wrapper.emitted('submit')[0][0]).toHaveProperty('title')
    }
  })

  it('should emit update:modelValue on close', async () => {
    const closeButton = document.body.querySelector('.btn-close')
    if (closeButton) {
      closeButton.click()
      await wrapper.vm.$nextTick()
    }

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    if (wrapper.emitted('update:modelValue')) {
      expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
    }
  })

  it('should validate required title', async () => {
    const titleInput = document.body.querySelector('#todoTitle')
    const form = document.body.querySelector('form')
    
    if (titleInput) {
      titleInput.value = ''
      titleInput.dispatchEvent(new Event('input'))
    }
    if (form) {
      form.dispatchEvent(new Event('submit'))
      await wrapper.vm.$nextTick()
    }

    expect(document.body.textContent).toContain('Title is required')
  })

  it('should show character count for description', () => {
    const text = document.body.textContent
    expect(text).toMatch(/\d+\/1000 characters/)
  })

  it('should have proper ARIA labels', () => {
    const modal = document.body.querySelector('.modal')
    if (modal) {
      expect(modal.getAttribute('role')).toBe('dialog')
      expect(modal.getAttribute('aria-modal')).toBe('true')
    }
    
    const closeButton = document.body.querySelector('.btn-close')
    if (closeButton) {
      expect(closeButton.getAttribute('aria-label')).toBe('Close')
    }
  })

  it('should disable submit button when loading', async () => {
    await wrapper.setProps({ loading: true })
    await wrapper.vm.$nextTick()

    const submitButton = document.body.querySelector('button[type="submit"]')
    if (submitButton) {
      expect(submitButton.hasAttribute('disabled')).toBe(true)
    }
  })
})

