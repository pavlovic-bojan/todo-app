const UserService = require('../services/UserService')

// Register user
const registerUser = async (req, res, next) => {
    try {
        const result = await UserService.registerUser(req.body)
        res.status(201).json(result)
    } catch (error) {
        next(error)
    }
}

// Login user
const loginUser = async (req, res, next) => {
    try {
        const result = await UserService.loginUser(req.body)
        
        // Set refresh token as httpOnly cookie
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        // Don't send refresh token in response body
        delete result.refreshToken

        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Refresh access token
const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken
        
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' })
        }

        const result = await UserService.refreshAccessToken(refreshToken)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Logout user
const logoutUser = async (req, res, next) => {
    try {
        await UserService.logoutUser(req.user.id)
        
        // Clear refresh token cookie
        res.clearCookie('refreshToken')
        
        res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        next(error)
    }
}

// Forgot password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body
        const result = await UserService.forgotPassword(email)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Reset password
const resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body
        const result = await UserService.resetPassword(resetToken, newPassword)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Get all users (Admin only)
const getAllUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers()
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

// Get user by ID
const getUserById = async (req, res, next) => {
    try {
        const user = await UserService.getUserById(req.params.id)
        res.status(200).json(user)
    } catch (error) {
        next(error)
    }
}

// Update user
const updateUser = async (req, res, next) => {
    try {
        const result = await UserService.updateUser(req.params.id, req.body)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

// Delete user
const deleteUser = async (req, res, next) => {
    try {
        const result = await UserService.deleteUser(req.params.id)
        res.status(200).json(result)
    } catch (error) {
        next(error)
    }
}

module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}
