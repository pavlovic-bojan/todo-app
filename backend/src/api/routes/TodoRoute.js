const express = require('express')
const router = express.Router()
const TodoController = require('../controllers/TodoController')
const authenticateAndAuthorize = require('../middleware/AuthenticateAndAuthorize')
const {
    validateTodoCreate,
    validateTodoUpdate,
    validateIdParam
} = require('../middleware/ValidationMiddleware')

/**
 * @swagger
 * /todos:
 *   post:
 *     tags:
 *       - Todos
 *     summary: Create a new todo
 *     description: Create a new todo item for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy groceries
 *               description:
 *                 type: string
 *                 example: Milk, eggs, bread
 *     responses:
 *       201:
 *         description: Todo created successfully
 *       400:
 *         description: Missing required fields or validation error
 *       401:
 *         description: Unauthorized
 */
router.post('', authenticateAndAuthorize(['admin', 'client']), validateTodoCreate, TodoController.createTodo)

/**
 * @swagger
 * /todos:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Get all todos
 *     description: Get all todos for the authenticated user. Admin can see all todos from all users.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Filter by user ID (Admin only)
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   completed:
 *                     type: boolean
 *                   userId:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                   user:
 *                     type: object
 *       401:
 *         description: Unauthorized
 */
router.get('', authenticateAndAuthorize(['admin', 'client']), TodoController.getAllTodos)

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     tags:
 *       - Todos
 *     summary: Get todo by ID
 *     description: Get a specific todo by ID. Users can only access their own todos, admin can access any todo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo found
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
router.get('/:id', authenticateAndAuthorize(['admin', 'client']), validateIdParam, TodoController.getTodoById)

/**
 * @swagger
 * /todos/{id}:
 *   patch:
 *     tags:
 *       - Todos
 *     summary: Update todo
 *     description: Update a todo item. Users can only update their own todos, admin can update any todo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       400:
 *         description: Invalid ID or data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
router.patch('/:id', authenticateAndAuthorize(['admin', 'client']), validateTodoUpdate, TodoController.updateTodo)

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     tags:
 *       - Todos
 *     summary: Delete todo
 *     description: Delete a todo item. Users can only delete their own todos, admin can delete any todo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
router.delete('/:id', authenticateAndAuthorize(['admin', 'client']), validateIdParam, TodoController.deleteTodo)

/**
 * @swagger
 * /todos/{id}/toggle:
 *   patch:
 *     tags:
 *       - Todos
 *     summary: Toggle todo completion status
 *     description: Toggle the completion status of a todo (from completed to not completed, or vice versa). Users can only toggle their own todos, admin can toggle any todo.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo completion status toggled successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Todo not found
 */
router.patch('/:id/toggle', authenticateAndAuthorize(['admin', 'client']), validateIdParam, TodoController.toggleTodoCompletion)

module.exports = router

