const TodoService = require('../../../api/services/TodoService')
const { prisma } = require('../../../config/db')

jest.mock('../../../config/db')

describe('TodoService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createTodo', () => {
    it('should successfully create a new todo', async () => {
      const userId = 1
      const todoData = {
        title: 'Test Todo',
        description: 'Test Description'
      }

      const mockTodo = {
        id: 1,
        title: todoData.title,
        description: todoData.description,
        completed: false,
        userId: userId,
        createdAt: new Date(),
        user: { id: 1, username: 'testuser', email: 'test@test.com' }
      }

      prisma.todo.create.mockResolvedValue(mockTodo)

      const result = await TodoService.createTodo(userId, todoData)

      expect(result.message).toBe('Todo created successfully')
      expect(result.todo.title).toBe(todoData.title)
      expect(prisma.todo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: todoData.title,
            userId: userId
          })
        })
      )
    })

    it('should throw error for empty title', async () => {
      const userId = 1
      const todoData = { title: '' }

      await expect(TodoService.createTodo(userId, todoData)).rejects.toThrow()
    })
  })

  describe('getAllTodos', () => {
    it('should return all todos for a user', async () => {
      const userId = 1
      const mockTodos = [
        { id: 1, title: 'Todo 1', userId: 1, completed: false },
        { id: 2, title: 'Todo 2', userId: 1, completed: true }
      ]

      prisma.todo.findMany.mockResolvedValue(mockTodos)

      const result = await TodoService.getAllTodos(userId)

      expect(result).toEqual(mockTodos)
      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: userId }
        })
      )
    })

    it('should filter todos by completion status', async () => {
      const userId = 1
      const filters = { completed: 'true' }

      prisma.todo.findMany.mockResolvedValue([])

      await TodoService.getAllTodos(userId, filters)

      expect(prisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            completed: true
          })
        })
      )
    })
  })

  describe('getTodoById', () => {
    it('should return todo for valid ID and owner', async () => {
      const todoId = 1
      const userId = 1

      const mockTodo = {
        id: todoId,
        title: 'Test Todo',
        userId: userId,
        user: { id: userId, username: 'test' }
      }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)

      const result = await TodoService.getTodoById(todoId, userId, false)

      expect(result).toEqual(mockTodo)
    })

    it('should throw error if todo not found', async () => {
      prisma.todo.findFirst.mockResolvedValue(null)

      await expect(TodoService.getTodoById(1, 1, false)).rejects.toThrow('Todo not found')
    })

    it('should allow admin to access any todo', async () => {
      const mockTodo = { id: 1, title: 'Test', userId: 2 }
      prisma.todo.findFirst.mockResolvedValue(mockTodo)

      const result = await TodoService.getTodoById(1, 1, true)

      expect(result).toEqual(mockTodo)
      expect(prisma.todo.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1 }
        })
      )
    })
  })

  describe('updateTodo', () => {
    it('should successfully update todo', async () => {
      const todoId = 1
      const userId = 1
      const updates = { title: 'Updated Title', completed: true }

      const mockExistingTodo = { id: todoId, userId: userId, title: 'Old Title' }
      const mockUpdatedTodo = { ...mockExistingTodo, ...updates }

      prisma.todo.findFirst.mockResolvedValue(mockExistingTodo)
      prisma.todo.update.mockResolvedValue(mockUpdatedTodo)

      const result = await TodoService.updateTodo(todoId, userId, updates, false)

      expect(result.message).toBe('Todo updated successfully')
      expect(result.todo.title).toBe('Updated Title')
      expect(prisma.todo.update).toHaveBeenCalled()
    })

    it('should throw error if todo not found', async () => {
      prisma.todo.findFirst.mockResolvedValue(null)

      await expect(TodoService.updateTodo(1, 1, {}, false)).rejects.toThrow('Todo not found')
    })
  })

  describe('deleteTodo', () => {
    it('should successfully delete todo', async () => {
      const todoId = 1
      const userId = 1

      const mockTodo = { id: todoId, userId: userId }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)
      prisma.todo.delete.mockResolvedValue(mockTodo)

      const result = await TodoService.deleteTodo(todoId, userId, false)

      expect(result.message).toBe('Todo deleted successfully')
      expect(prisma.todo.delete).toHaveBeenCalledWith({ where: { id: todoId } })
    })

    it('should throw error if todo not found', async () => {
      prisma.todo.findFirst.mockResolvedValue(null)

      await expect(TodoService.deleteTodo(1, 1, false)).rejects.toThrow('Todo not found')
    })
  })

  describe('toggleTodoCompletion', () => {
    it('should toggle todo from incomplete to complete', async () => {
      const todoId = 1
      const userId = 1

      const mockTodo = { id: todoId, userId: userId, completed: false }
      const mockToggledTodo = { ...mockTodo, completed: true }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)
      prisma.todo.update.mockResolvedValue(mockToggledTodo)

      const result = await TodoService.toggleTodoCompletion(todoId, userId, false)

      expect(result.todo.completed).toBe(true)
      expect(prisma.todo.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { completed: true }
        })
      )
    })

    it('should toggle todo from complete to incomplete', async () => {
      const todoId = 1
      const userId = 1

      const mockTodo = { id: todoId, userId: userId, completed: true }
      const mockToggledTodo = { ...mockTodo, completed: false }

      prisma.todo.findFirst.mockResolvedValue(mockTodo)
      prisma.todo.update.mockResolvedValue(mockToggledTodo)

      const result = await TodoService.toggleTodoCompletion(todoId, userId, false)

      expect(result.todo.completed).toBe(false)
    })
  })
})

