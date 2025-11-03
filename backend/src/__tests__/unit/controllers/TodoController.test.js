const TodoController = require('../../../api/controllers/TodoController')
const TodoService = require('../../../api/services/TodoService')

// Mock TodoService
jest.mock('../../../api/services/TodoService')

describe('TodoController', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, username: 'testuser', role: 'client' }
    }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
    jest.clearAllMocks()
  })

  describe('createTodo', () => {
    it('should create todo and return 201', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'Test description'
      }

      const mockResult = {
        message: 'Todo created successfully',
        todo: { id: 1, ...todoData, userId: 1 }
      }

      req.body = todoData
      TodoService.createTodo.mockResolvedValue(mockResult)

      await TodoController.createTodo(req, res, next)

      expect(TodoService.createTodo).toHaveBeenCalledWith(1, todoData)
      expect(res.status).toHaveBeenCalledWith(201)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })

    it('should call next with error on failure', async () => {
      const error = new Error('Create failed')
      TodoService.createTodo.mockRejectedValue(error)

      await TodoController.createTodo(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getAllTodos', () => {
    it('should return all todos for regular user', async () => {
      const mockTodos = [
        { id: 1, title: 'Todo 1', userId: 1 },
        { id: 2, title: 'Todo 2', userId: 1 }
      ]

      TodoService.getAllTodos.mockResolvedValue(mockTodos)

      await TodoController.getAllTodos(req, res, next)

      expect(TodoService.getAllTodos).toHaveBeenCalledWith(1, {})
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockTodos)
    })

    it('should call getAllTodosAdmin for admin user', async () => {
      req.user.role = 'admin'
      req.query = { completed: 'true' }

      const mockTodos = [
        { id: 1, title: 'Todo 1', userId: 1 },
        { id: 2, title: 'Todo 2', userId: 2 }
      ]

      TodoService.getAllTodosAdmin.mockResolvedValue(mockTodos)

      await TodoController.getAllTodos(req, res, next)

      expect(TodoService.getAllTodosAdmin).toHaveBeenCalledWith({ completed: 'true' })
      expect(res.json).toHaveBeenCalledWith(mockTodos)
    })
  })

  describe('getTodoById', () => {
    it('should return todo by ID', async () => {
      req.params.id = '1'

      const mockTodo = { id: 1, title: 'Test Todo', userId: 1 }

      TodoService.getTodoById.mockResolvedValue(mockTodo)

      await TodoController.getTodoById(req, res, next)

      expect(TodoService.getTodoById).toHaveBeenCalledWith('1', 1, false)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockTodo)
    })

    it('should pass isAdmin flag for admin users', async () => {
      req.user.role = 'admin'
      req.params.id = '1'

      const mockTodo = { id: 1, title: 'Test Todo', userId: 2 }

      TodoService.getTodoById.mockResolvedValue(mockTodo)

      await TodoController.getTodoById(req, res, next)

      expect(TodoService.getTodoById).toHaveBeenCalledWith('1', 1, true)
    })
  })

  describe('updateTodo', () => {
    it('should update todo', async () => {
      req.params.id = '1'
      req.body = { title: 'Updated Title' }

      const mockResult = {
        message: 'Todo updated successfully',
        todo: { id: 1, title: 'Updated Title' }
      }

      TodoService.updateTodo.mockResolvedValue(mockResult)

      await TodoController.updateTodo(req, res, next)

      expect(TodoService.updateTodo).toHaveBeenCalledWith('1', 1, req.body, false)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('deleteTodo', () => {
    it('should delete todo', async () => {
      req.params.id = '1'

      const mockResult = { message: 'Todo deleted successfully' }

      TodoService.deleteTodo.mockResolvedValue(mockResult)

      await TodoController.deleteTodo(req, res, next)

      expect(TodoService.deleteTodo).toHaveBeenCalledWith('1', 1, false)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('toggleTodoCompletion', () => {
    it('should toggle todo completion', async () => {
      req.params.id = '1'

      const mockResult = {
        message: 'Todo toggled',
        todo: { id: 1, completed: true }
      }

      TodoService.toggleTodoCompletion.mockResolvedValue(mockResult)

      await TodoController.toggleTodoCompletion(req, res, next)

      expect(TodoService.toggleTodoCompletion).toHaveBeenCalledWith('1', 1, false)
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(mockResult)
    })
  })

  describe('Error Handling', () => {
    it('should pass errors to next middleware', async () => {
      const error = new Error('Service error')
      TodoService.createTodo.mockRejectedValue(error)

      await TodoController.createTodo(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
      expect(res.status).not.toHaveBeenCalled()
    })
  })
})

