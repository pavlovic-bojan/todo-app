const logger = require('../../config/logger')

const errorHandler = (err, req, res, next) => {
    // Log all errors with details, regardless of environment
    logger.error({
        message: err.message,
        stack: err.stack,
        statusCode: err.status || 500,
        url: req.originalUrl,
        method: req.method,
        ip: req.ip,
        timestamp: new Date().toISOString()
    })

    // Default values for status and message
    let statusCode = 500  // Internal Server Error as default
    let message = 'Something went wrong'

    // Map error messages to appropriate HTTP status codes and messages
    switch (err.message) {
        case 'User not found':
        case 'Todo not found':
            statusCode = 404
            message = err.message
            break
        case 'Invalid ID format':
            statusCode = 400
            message = 'Invalid ID format'
            break
        case 'User already exists':
        case 'Email already exists':
            statusCode = 409
            message = err.message
            break
        case 'Database is not connected':
            statusCode = 500
            message = 'Database connection failed'
            break
        case 'Missing required fields':
            statusCode = 400
            message = 'Required fields are missing'
            break
        case 'Invalid credentials':
            statusCode = 401
            message = 'Invalid credentials'
            break
        case 'Invalid or expired reset token':
            statusCode = 400
            message = 'Invalid or expired reset token'
            break
        case 'Unauthorized access':
            statusCode = 403
            message = 'You do not have permission to access this resource'
            break
        default:
            // For unknown errors, send a generic message
            statusCode = err.status || 500
            message = err.message || 'An unexpected error occurred'
            break
    }

    // Send the response back to the client
    res.status(statusCode).json({
        message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    })
}

module.exports = errorHandler

