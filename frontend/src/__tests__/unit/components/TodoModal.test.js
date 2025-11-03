import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TodoModal from '@/components/TodoModal.vue'

describe('TodoModal Component', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TodoModal, {
      props: {
        modelValue: true,
        todo: null,
        loading: false
      }
    })
  })

  it('should render modal when modelValue is true', () => {
    expect(wrapper.find('.modal').exists()).toBe(true)
    expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
  })

  it('should show "Create New Todo" title for new todo', () => {
    expect(wrapper.text()).toContain('Create New Todo')
  })

  it('should show "Edit Todo" title when editing', async () => {
    await wrapper.setProps({
      todo: { id: 1, title: 'Test', description: 'Test desc' }
    })

    expect(wrapper.text()).toContain('Edit Todo')
  })

  it('should populate form when editing existing todo', async () => {
    const todo = {
      id: 1,
      title: 'Test Todo',
      description: 'Test Description'
    }

    await wrapper.setProps({
      modelValue: true,
      todo: todo
    })

    expect(wrapper.find('#todoTitle').element.value).toBe(todo.title)
    expect(wrapper.find('#todoDescription').element.value).toBe(todo.description)
  })

  it('should emit submit event with sanitized data', async () => {
    await wrapper.find('#todoTitle').setValue('Test Title')
    await wrapper.find('#todoDescription').setValue('Test Description')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('submit')).toBeTruthy()
    expect(wrapper.emitted('submit')[0][0]).toHaveProperty('title')
  })

  it('should emit update:modelValue on close', async () => {
    await wrapper.find('.btn-close').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(false)
  })

  it('should validate required title', async () => {
    await wrapper.find('#todoTitle').setValue('')
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.text()).toContain('Title is required')
  })

  it('should show character count for description', () => {
    expect(wrapper.text()).toContain('0/1000 characters')
  })

  it('should have proper ARIA labels', () => {
    expect(wrapper.find('.modal').attributes('role')).toBe('dialog')
    expect(wrapper.find('.modal').attributes('aria-modal')).toBe('true')
    expect(wrapper.find('.btn-close').attributes('aria-label')).toBe('Close')
  })

  it('should disable submit button when loading', async () => {
    await wrapper.setProps({ loading: true })

    const submitButton = wrapper.find('button[type="submit"]')
    expect(submitButton.attributes('disabled')).toBeDefined()
  })
})

