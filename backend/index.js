require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { connectToDB } = require('./src/config/db')
const { startServerAPI } = require('./src/config/StartServer')
const mainRoutes = require('./src/api/routes')
const errorHandler = require('./src/api/middleware/ErrorHandler')
const { setupSwagger } = require('./src/config/SwaggerConfig')
const {
    helmetConfig,
    generalLimiter,
    compressionConfig
} = require('./src/config/security')

const app = express();

(async () => {
    try {
        // Connect to database
        await connectToDB()

        // Security middleware - should be first
        app.use(helmetConfig)
        app.use(compressionConfig)

        // CORS configuration
        app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true, // Allow cookies
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization']
        }))

        // Cookie parser - before routes
        app.use(cookieParser())

        // Body parsers
        app.use(express.json({ limit: '10mb' }))
        app.use(express.urlencoded({ extended: true, limit: '10mb' }))

        // Apply general rate limiting to all API routes
        app.use('/api', generalLimiter)

        // Swagger documentation
        setupSwagger(app)

        // API routes
        app.use('/api', mainRoutes)

        // Root endpoint
        app.get('/', (req, res) => {
            res.json({
                message: 'Welcome to Todo API',
                documentation: '/api/docs',
                health: '/api/health'
            })
        })

        // Error handling middleware (must be last)
        app.use(errorHandler)

        // Start server
        startServerAPI(app)
    } catch (err) {
        console.error('Application failed to start:', err.message)
        process.exit(1)
    }
})()
