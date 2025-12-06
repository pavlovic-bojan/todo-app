const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const compression = require('compression')

// Helmet - Security headers
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false,
})

// Rate limiting configuration
const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { message },
        standardHeaders: true,
        legacyHeaders: false,
    })
}

// General API rate limiter
const generalLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per windowMs
    'Too many requests from this IP, please try again later'
)

// Strict rate limiter for auth endpoints
const authLimiter = createRateLimiter(
    15 * 60 * 1000, // 15 minutes
    1000, // 1000 requests per windowMs
    'Too many authentication attempts, please try again later'
)

// Very strict for password reset
const passwordResetLimiter = createRateLimiter(
    60 * 60 * 1000, // 1 hour
    3, // 3 requests per hour
    'Too many password reset attempts, please try again later'
)

// Compression middleware
const compressionConfig = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false
        }
        return compression.filter(req, res)
    },
    level: 6, // Balance between speed and compression ratio
})

module.exports = {
    helmetConfig,
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    compressionConfig
}

