// Validate email format
function validateEmail(email) {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
        throw new Error('Valid email address is required')
    }
}

// Validate password
function validatePassword(password) {
    if (!password || password.length < 6) {
        throw new Error('Password must be at least 6 characters long')
    }
}

// Validate username
function validateUsername(username) {
    if (!username || typeof username !== 'string' || username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters long')
    }
}

// Validate age
function validateAge(age) {
    if (age && (typeof age !== 'number' || age < 1 || age > 120)) {
        throw new Error('Age must be a valid number between 1 and 120')
    }
}

// Validate role
function validateRole(role) {
    const validRoles = ['client', 'admin']
    if (role && !validRoles.includes(role)) {
        throw new Error('Invalid role. Must be client or admin')
    }
}

// Validate user registration data
function validateUserRegistration(data) {
    const { username, email, password, role } = data

    if (!username || !email || !password) {
        throw new Error('Missing required fields: username, email, password')
    }

    validateUsername(username)
    validateEmail(email)
    validatePassword(password)
    if (role) validateRole(role)
}

// Validate user login data
function validateUserLogin(data) {
    const { username, password } = data

    if (!username || !password) {
        throw new Error('Missing required fields: username and password')
    }
}

// Validate todo data
function validateTodoData(data) {
    const { title } = data

    if (!title || typeof title !== 'string' || title.trim().length < 1) {
        throw new Error('Todo title is required and must be a valid string')
    }

    if (title.length > 255) {
        throw new Error('Todo title must not exceed 255 characters')
    }
}

// Validate todo update data
function validateTodoUpdate(data) {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid update payload')
    }

    if (data.title !== undefined) {
        if (typeof data.title !== 'string' || data.title.trim().length < 1) {
            throw new Error('Title must be a non-empty string')
        }
        if (data.title.length > 255) {
            throw new Error('Title must not exceed 255 characters')
        }
    }

    if (data.description !== undefined && data.description !== null) {
        if (typeof data.description !== 'string') {
            throw new Error('Description must be a string')
        }
    }

    if (data.completed !== undefined) {
        if (typeof data.completed !== 'boolean') {
            throw new Error('Completed must be a boolean')
        }
    }
}

// Validate ID (numeric for PostgreSQL auto-increment)
function validateId(id) {
    const numId = parseInt(id, 10)
    if (isNaN(numId) || numId <= 0) {
        throw new Error('Invalid ID format')
    }
    return numId
}

module.exports = {
    validateEmail,
    validatePassword,
    validateUsername,
    validateAge,
    validateRole,
    validateUserRegistration,
    validateUserLogin,
    validateTodoData,
    validateTodoUpdate,
    validateId
}

