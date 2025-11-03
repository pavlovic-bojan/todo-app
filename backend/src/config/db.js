const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

// PostgreSQL Connection Pool Configuration
const connectionString = process.env.DATABASE_URL

// Add connection pooling parameters for production
const getDatabaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        // Production: Add connection pooling params
        return `${connectionString}${connectionString.includes('?') ? '&' : '?'}connection_limit=10&pool_timeout=20`
    }
    // Development: Use as-is
    return connectionString
}

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    datasources: {
        db: {
            url: getDatabaseUrl()
        }
    }
})

async function connectToDB() {
    try {
        await prisma.$connect()
        console.log('✅ Connected to PostgreSQL database via Prisma!')
    } catch (err) {
        console.error('❌ Error connecting to database:', err.message)
        process.exit(1)
    }
}

async function disconnectFromDB() {
    try {
        await prisma.$disconnect()
        console.log('Disconnected from database')
    } catch (err) {
        console.error('Error disconnecting from database:', err.message)
    }
}

// Graceful shutdown
process.on('beforeExit', async () => {
    await disconnectFromDB()
})

module.exports = { prisma, connectToDB, disconnectFromDB }

