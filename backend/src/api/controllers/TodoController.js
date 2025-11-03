const TodoService = require('../services/TodoService')

// Create todo
const createTodo = async (req, res, next) => {
    try {
        const userId = req.user.id
        const result = await TodoService.createTodo(userId, req.body)
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
}

// Get all todos for logged-in user
const getAllTodos = async (req, res, next) => {
    try {
        const userId = req.user.id
        const isAdmin = req.user.role === 'admin'

        // Admin can see all todos, regular users only their own
        let todos
        if (isAdmin) {
            todos = await TodoService.getAllTodosAdmin(req.query)
        } else {
            todos = await TodoService.getAllTodos(userId, req.query)
        }

        res.status(200).json(todos)
    } catch (error) {
        next(error)
    }
}

// Get todo by ID
const getTodoById = async (req, res, next) => {
    try {
        const userId = req.user.id
        const isAdmin = req.user.role === 'admin'
        const todo = await TodoService.getTodoById(req.params.id, userId, isAdmin)
        res.status(200).json(todo)
    } catch (error) {
        next(error)
    }
}

// Update todo
const updateTodo = async (req, res, next) => {
    try {
        const userId = req.user.id
        const isAdmin = req.user.role === 'admin'
        const result = await TodoService.updateTodo(req.params.id, userId, req.body, isAdmin)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Delete todo
const deleteTodo = async (req, res, next) => {
    try {
        const userId = req.user.id
        const isAdmin = req.user.role === 'admin'
        const result = await TodoService.deleteTodo(req.params.id, userId, isAdmin)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Toggle todo completion
const toggleTodoCompletion = async (req, res, next) => {
    try {
        const userId = req.user.id
        const isAdmin = req.user.role === 'admin'
        const result = await TodoService.toggleTodoCompletion(req.params.id, userId, isAdmin)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTodo,
    getAllTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion
}

