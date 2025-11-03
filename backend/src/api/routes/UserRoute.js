const express = require('express')
const router = express.Router()
const UserController = require('../controllers/UserController')
const authenticateAndAuthorize = require('../middleware/AuthenticateAndAuthorize')
const { authLimiter, passwordResetLimiter } = require('../../config/security')
const {
    validateUserRegistration,
    validateUserLogin,
    validateForgotPassword,
    validateResetPassword,
    validateUserUpdate,
    validateIdParam
} = require('../middleware/ValidationMiddleware')

/**
 * @swagger
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Register a new user account. Default role is 'client' if not specified.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *               role:
 *                 type: string
 *                 enum: [client, admin]
 *                 example: client
 *               age:
 *                 type: integer
 *                 example: 25
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 *       429:
 *         description: Too many requests
 */
router.post('/register', authLimiter, validateUserRegistration, UserController.registerUser)

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login user
 *     description: Authenticate user and receive JWT access token (refresh token set as httpOnly cookie)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
router.post('/login', authLimiter, validateUserLogin, UserController.loginUser)

/**
 * @swagger
 * /users/refresh:
 *   post:
 *     tags:
 *       - Users
 *     summary: Refresh access token
 *     description: Get a new access token using refresh token from httpOnly cookie
 *     responses:
 *       200:
 *         description: Access token refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', UserController.refreshToken)

/**
 * @swagger
 * /users/logout:
 *   post:
 *     tags:
 *       - Users
 *     summary: Logout user
 *     description: Clear refresh token and logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticateAndAuthorize([]), UserController.logoutUser)

/**
 * @swagger
 * /users/forgot-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Request password reset
 *     description: Generate a password reset token. In production, this token should be sent via email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset token generated
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many requests
 */
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, UserController.forgotPassword)

/**
 * @swagger
 * /users/reset-password:
 *   post:
 *     tags:
 *       - Users
 *     summary: Reset password
 *     description: Reset user password using the reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 example: abc123def456ghi789
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewPassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 *       429:
 *         description: Too many requests
 */
router.post('/reset-password', passwordResetLimiter, validateResetPassword, UserController.resetPassword)

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get all users
 *     description: Retrieve all users (Admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('', authenticateAndAuthorize(['admin']), UserController.getAllUsers)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user by ID
 *     description: Retrieve a specific user by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticateAndAuthorize(['admin', 'client']), validateIdParam, UserController.getUserById)

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags:
 *       - Users
 *     summary: Update user
 *     description: Update user information
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [client, admin]
 *               age:
 *                 type: integer
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.patch('/:id', authenticateAndAuthorize(['admin', 'client']), validateUserUpdate, UserController.updateUser)

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags:
 *       - Users
 *     summary: Delete user
 *     description: Delete a user account (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: Invalid ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticateAndAuthorize(['admin']), validateIdParam, UserController.deleteUser)

module.exports = router
