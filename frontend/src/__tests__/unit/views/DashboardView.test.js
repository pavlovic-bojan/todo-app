import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'
import { todoAPI } from '@/services/api'

// Mock todoAPI
vi.mock('@/services/api', () => ({
  todoAPI: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    toggle: vi.fn()
  }
}))

describe('DashboardView', () => {
  let authStore

  beforeEach(() => {
    setActivePinia(createPinia())
    authStore = useAuthStore()
    authStore.user = { id: 1, username: 'testuser', email: 'test@test.com', role: 'client' }
    authStore.accessToken = 'test_token'

    vi.clearAllMocks()
  })

  it('should render dashboard with user info', async () => {
    todoAPI.getAll.mockResolvedValue({ data: [] })

    const wrapper = mount(DashboardView)
    await flushPromises()

    expect(wrapper.find('h1').text()).toContain('My Todos')
    expect(wrapper.text()).toContain('testuser')
  })

  it('should show loading state', async () => {
    todoAPI.getAll.mockImplementation(() => new Promise(() => {}))

    const wrapper = mount(DashboardView)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.spinner-border').exists()).toBe(true)
    expect(wrapper.text()).toContain('Loading')
  })

  it('should fetch todos on mount', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true }
    ]

    todoAPI.getAll.mockResolvedValue({ data: mockTodos })

    const wrapper = mount(DashboardView)
    await flushPromises()

    expect(todoAPI.getAll).toHaveBeenCalled()
    expect(wrapper.vm.todos).toHaveLength(2)
  })

  it('should show "New Todo" button', async () => {
    todoAPI.getAll.mockResolvedValue({ data: [] })

    const wrapper = mount(DashboardView)
    await flushPromises()

    const buttons = wrapper.findAll('button')
    const hasNewButton = buttons.some(btn => btn.text().includes('New Todo'))
    expect(hasNewButton).toBe(true)
  })

  it('should have filter buttons', async () => {
    todoAPI.getAll.mockResolvedValue({ data: [] })

    const wrapper = mount(DashboardView)
    await flushPromises()

    expect(wrapper.text()).toContain('All')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('Completed')
  })

  it('should show statistics cards', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true },
      { id: 3, title: 'Todo 3', completed: false }
    ]

    todoAPI.getAll.mockResolvedValue({ data: mockTodos })

    const wrapper = mount(DashboardView)
    await flushPromises()

    expect(wrapper.text()).toContain('Total Todos')
    expect(wrapper.text()).toContain('Active')
    expect(wrapper.text()).toContain('Completed')
  })

  it('should filter todos by status', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true }
    ]

    todoAPI.getAll.mockResolvedValue({ data: mockTodos })

    const wrapper = mount(DashboardView)
    await flushPromises()

    // Test filter computed property
    wrapper.vm.filter = 'active'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.filteredTodos).toHaveLength(1)

    wrapper.vm.filter = 'completed'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.filteredTodos).toHaveLength(1)

    wrapper.vm.filter = 'all'
    await wrapper.vm.$nextTick()
    expect(wrapper.vm.filteredTodos).toHaveLength(2)
  })

  it('should have proper ARIA attributes', async () => {
    todoAPI.getAll.mockResolvedValue({ data: [] })

    const wrapper = mount(DashboardView)
    await flushPromises()

    const main = wrapper.find('main')
    expect(main.attributes('role')).toBe('main')

    const sidebar = wrapper.find('nav')
    expect(sidebar.attributes('aria-label')).toBeDefined()
  })

  it('should show empty state when no todos', async () => {
    todoAPI.getAll.mockResolvedValue({ data: [] })

    const wrapper = mount(DashboardView)
    await flushPromises()

    expect(wrapper.text()).toContain('No todos found')
  })

  it('should calculate statistics correctly', async () => {
    const mockTodos = [
      { id: 1, title: 'Todo 1', completed: false },
      { id: 2, title: 'Todo 2', completed: true },
      { id: 3, title: 'Todo 3', completed: false }
    ]

    todoAPI.getAll.mockResolvedValue({ data: mockTodos })

    const wrapper = mount(DashboardView)
    await flushPromises()

    expect(wrapper.vm.activeTodos).toBe(2)
    expect(wrapper.vm.completedTodos).toBe(1)
  })
})

