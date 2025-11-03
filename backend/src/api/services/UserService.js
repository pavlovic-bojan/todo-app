const { prisma } = require('../../config/db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

// Token generation helpers
const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' } // Short-lived access token
    )
}

const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: '7d' } // Long-lived refresh token
    )
}

// Register a new user
const registerUser = async (userData) => {
    const { username, email, password, role = 'client', age } = userData

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [{ username }, { email }]
        }
    })

    if (existingUser) {
        if (existingUser.username === username) {
            throw new Error('User already exists')
        }
        if (existingUser.email === email) {
            throw new Error('Email already exists')
        }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12) // Increased to 12 rounds

    // Create new user
    const newUser = await prisma.user.create({
        data: {
            username,
            email,
            hashedPassword,
            role,
            age: age ? parseInt(age) : null
        },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            age: true,
            createdAt: true
        }
    })

    return {
        message: 'User registered successfully',
        user: newUser
    }
}

// Login user
const loginUser = async (loginData) => {
    const { username, password } = loginData

    // Find user by username
    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        throw new Error('Invalid credentials')
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword)
    if (!passwordMatch) {
        throw new Error('Invalid credentials')
    }

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Store refresh token in database
    const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    await prisma.user.update({
        where: { id: user.id },
        data: {
            refreshToken,
            refreshTokenExpiry
        }
    })

    return {
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    }
}

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new Error('Refresh token is required')
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        )

        // Find user and check if refresh token matches
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        })

        if (!user || user.refreshToken !== refreshToken) {
            throw new Error('Invalid refresh token')
        }

        // Check if refresh token is expired in database
        if (user.refreshTokenExpiry && new Date() > user.refreshTokenExpiry) {
            throw new Error('Refresh token expired')
        }

        // Generate new access token
        const accessToken = generateAccessToken(user)

        return {
            message: 'Access token refreshed',
            accessToken
        }
    } catch (error) {
        throw new Error('Invalid or expired refresh token')
    }
}

// Logout user
const logoutUser = async (userId) => {
    // Clear refresh token from database
    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshToken: null,
            refreshTokenExpiry: null
        }
    })

    return { message: 'Logged out successfully' }
}

// Forgot password - Generate reset token
const forgotPassword = async (email) => {
    if (!email) {
        throw new Error('Email is required')
    }

    // Find user by email
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        // Don't reveal if email exists - security best practice
        return {
            message: 'If the email exists, a password reset link has been sent'
        }
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex')

    // Hash the token before storing in database
    const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    const resetTokenExpiry = new Date(
        Date.now() + parseInt(process.env.RESET_TOKEN_EXPIRY || 3600000)
    )

    // Save hashed token to database
    await prisma.user.update({
        where: { id: user.id },
        data: {
            hashedResetToken,
            resetTokenExpiry
        }
    })

    // In production, send this token via email
    // For now, return it (ONLY FOR DEVELOPMENT)
    return {
        message: 'Password reset token generated successfully',
        resetToken, // Send this via email in production
        email: user.email
    }
}

// Reset password using token
const resetPassword = async (resetToken, newPassword) => {
    if (!resetToken || !newPassword) {
        throw new Error('Reset token and new password are required')
    }

    // Hash the provided token to compare with database
    const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex')

    // Find user by hashed reset token
    const user = await prisma.user.findFirst({
        where: {
            hashedResetToken,
            resetTokenExpiry: {
                gte: new Date()
            }
        }
    })

    if (!user) {
        throw new Error('Invalid or expired reset token')
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update user password and clear reset token
    await prisma.user.update({
        where: { id: user.id },
        data: {
            hashedPassword,
            hashedResetToken: null,
            resetTokenExpiry: null,
            // Also clear refresh token for security
            refreshToken: null,
            refreshTokenExpiry: null
        }
    })

    return { message: 'Password reset successfully' }
}

// Get all users (Admin only)
const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            age: true,
            createdAt: true,
            updatedAt: true
        }
    })

    return users
}

// Get user by ID
const getUserById = async (id) => {
    const validId = parseInt(id, 10)
    if (isNaN(validId) || validId <= 0) {
        throw new Error('Invalid ID format')
    }

    const user = await prisma.user.findUnique({
        where: { id: validId },
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            age: true,
            createdAt: true,
            updatedAt: true
        }
    })

    if (!user) {
        throw new Error('User not found')
    }

    return user
}

// Update user
const updateUser = async (id, updates) => {
    const validId = parseInt(id, 10)
    if (isNaN(validId) || validId <= 0) {
        throw new Error('Invalid ID format')
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: validId }
    })

    if (!existingUser) {
        throw new Error('User not found')
    }

    // Prepare update data
    const updateData = {}

    if (updates.email) updateData.email = updates.email
    if (updates.age) updateData.age = parseInt(updates.age)
    if (updates.role) updateData.role = updates.role
    if (updates.password) {
        updateData.hashedPassword = await bcrypt.hash(updates.password, 12)
        // Clear refresh token when password changes
        updateData.refreshToken = null
        updateData.refreshTokenExpiry = null
    }

    // Update user
    const updatedUser = await prisma.user.update({
        where: { id: validId },
        data: updateData,
        select: {
            id: true,
            username: true,
            email: true,
            role: true,
            age: true,
            updatedAt: true
        }
    })

    return {
        message: 'User updated successfully',
        user: updatedUser
    }
}

// Delete user
const deleteUser = async (id) => {
    const validId = parseInt(id, 10)
    if (isNaN(validId) || validId <= 0) {
        throw new Error('Invalid ID format')
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
        where: { id: validId }
    })

    if (!existingUser) {
        throw new Error('User not found')
    }

    // Delete user (todos will be deleted automatically due to cascade)
    await prisma.user.delete({
        where: { id: validId }
    })

    return { message: 'User deleted successfully' }
}

module.exports = {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
}
