const { prisma } = require('../../config/db')
const { validateTodoData, validateTodoUpdate, validateId } = require('../validations/Validation')

// Create a new todo
const createTodo = async (userId, todoData) => {
    const { title, description } = todoData

    // Validate todo data
    validateTodoData({ title })

    // Create new todo
    const newTodo = await prisma.todo.create({
        data: {
            title,
            description: description || null,
            userId: parseInt(userId),
            completed: false
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })

    return {
        message: 'Todo created successfully',
        todo: newTodo
    }
}

// Get all todos for a user
const getAllTodos = async (userId, filters = {}) => {
    const { completed } = filters

    const where = {
        userId: parseInt(userId)
    }

    // Filter by completed status if provided
    if (completed !== undefined) {
        where.completed = completed === 'true' || completed === true
    }

    const todos = await prisma.todo.findMany({
        where,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })

    return todos
}

// Get all todos (Admin only - can see all users' todos)
const getAllTodosAdmin = async (filters = {}) => {
    const { completed, userId } = filters

    const where = {}

    // Filter by completed status if provided
    if (completed !== undefined) {
        where.completed = completed === 'true' || completed === true
    }

    // Filter by userId if provided
    if (userId) {
        where.userId = parseInt(userId)
    }

    const todos = await prisma.todo.findMany({
        where,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })

    return todos
}

// Get todo by ID
const getTodoById = async (todoId, userId, isAdmin = false) => {
    const validTodoId = validateId(todoId)

    const where = {
        id: validTodoId
    }

    // Non-admin users can only access their own todos
    if (!isAdmin) {
        where.userId = parseInt(userId)
    }

    const todo = await prisma.todo.findFirst({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })

    if (!todo) {
        throw new Error('Todo not found')
    }

    return todo
}

// Update todo
const updateTodo = async (todoId, userId, updates, isAdmin = false) => {
    const validTodoId = validateId(todoId)

    // Validate update data
    validateTodoUpdate(updates)

    // Check if todo exists
    const where = {
        id: validTodoId
    }

    // Non-admin users can only update their own todos
    if (!isAdmin) {
        where.userId = parseInt(userId)
    }

    const existingTodo = await prisma.todo.findFirst({
        where
    })

    if (!existingTodo) {
        throw new Error('Todo not found')
    }

    // Prepare update data
    const updateData = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.description !== undefined) updateData.description = updates.description
    if (updates.completed !== undefined) updateData.completed = updates.completed

    // Update todo
    const updatedTodo = await prisma.todo.update({
        where: { id: validTodoId },
        data: updateData,
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })

    return {
        message: 'Todo updated successfully',
        todo: updatedTodo
    }
}

// Delete todo
const deleteTodo = async (todoId, userId, isAdmin = false) => {
    const validTodoId = validateId(todoId)

    // Check if todo exists
    const where = {
        id: validTodoId
    }

    // Non-admin users can only delete their own todos
    if (!isAdmin) {
        where.userId = parseInt(userId)
    }

    const existingTodo = await prisma.todo.findFirst({
        where
    })

    if (!existingTodo) {
        throw new Error('Todo not found')
    }

    // Delete todo
    await prisma.todo.delete({
        where: { id: validTodoId }
    })

    return { message: 'Todo deleted successfully' }
}

// Toggle todo completion status
const toggleTodoCompletion = async (todoId, userId, isAdmin = false) => {
    const validTodoId = validateId(todoId)

    // Check if todo exists
    const where = {
        id: validTodoId
    }

    // Non-admin users can only toggle their own todos
    if (!isAdmin) {
        where.userId = parseInt(userId)
    }

    const existingTodo = await prisma.todo.findFirst({
        where
    })

    if (!existingTodo) {
        throw new Error('Todo not found')
    }

    // Toggle completion status
    const updatedTodo = await prisma.todo.update({
        where: { id: validTodoId },
        data: {
            completed: !existingTodo.completed
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    email: true
                }
            }
        }
    })

    return {
        message: 'Todo completion status toggled successfully',
        todo: updatedTodo
    }
}

module.exports = {
    createTodo,
    getAllTodos,
    getAllTodosAdmin,
    getTodoById,
    updateTodo,
    deleteTodo,
    toggleTodoCompletion
}

