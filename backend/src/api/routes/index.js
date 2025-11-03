const express = require('express')
const router = express.Router()

// Import route files
const UserRoute = require('./UserRoute')
const TodoRoute = require('./TodoRoute')

// Mount individual routes
router.use('/users', UserRoute)
router.use('/todos', TodoRoute)

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Todo API is running',
        timestamp: new Date().toISOString()
    })
})

module.exports = router

