const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET

// Middleware function to authenticate and authorize users based on their roles
const authenticateAndAuthorize = (roles = []) => {
    return (req, res, next) => {
        try {
            // Check if the Authorization header exists and if it starts with "Bearer "
            const authHeader = req.headers.authorization
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ message: 'Authorization header missing or malformed' })
            }

            // Extract the token from the Authorization header
            const token = authHeader.split(' ')[1]

            // Verify the token using the secret key and decode the payload directly into req.user
            req.user = jwt.verify(token, JWT_SECRET)

            // If roles are provided, check if the user's role matches one of the allowed roles
            if (roles.length && !roles.includes(req.user.role)) {
                // If the user's role is not allowed, respond with a 403 Forbidden error
                return res.status(403).json({ message: 'You do not have the required permissions' })
            }

            // If the token is valid and the user has the appropriate role, proceed to the next middleware or route handler
            next()
        } catch (error) {
            // If an error occurs (e.g., invalid or expired token), respond with a 401 Unauthorized error
            res.status(401).json({ message: 'Invalid or expired token' })
        }
    }
}

module.exports = authenticateAndAuthorize

