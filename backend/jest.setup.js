// Jest setup file
require('dotenv').config({ path: '.env.test' })

// Mock Prisma Client for unit tests
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    todo: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    $connect: jest.fn(),
    $disconnect: jest.fn()
  }

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  }
})

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_purposes_only'
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_for_testing_purposes_only'
process.env.RESET_TOKEN_EXPIRY = '3600000'

