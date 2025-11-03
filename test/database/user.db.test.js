/**
 * User Database Tests
 * Direct SQLite database testing
 */
const { test, expect } = require('@playwright/test')
const { allure } = require('allure-playwright')
const dbHelper = require('../helpers/db.helper')
const authHelper = require('../helpers/auth.helper')
const apiHelper = require('../helpers/api.helper')

test.describe('User Database Tests', () => {

  test.beforeAll(() => {
    dbHelper.connect()
  })

  test.afterAll(() => {
    dbHelper.close()
  })

  test('should create user record in database @db @user', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('User Creation')
    await allure.severity('critical')
    await allure.tag('@db', '@user')

    const { userData } = await authHelper.createTestUser()

    await allure.step('Verify user exists in database', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB).toBeTruthy()
      expect(userInDB.email).toBe(userData.email)
      expect(userInDB.role).toBe(userData.role)
      
      await allure.attachment('User in DB', JSON.stringify(userInDB, null, 2), 'application/json')
    })
  })

  test('should enforce unique username constraint @db @user @integrity', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Unique Constraints')
    await allure.severity('critical')
    await allure.tag('@db', '@user', '@integrity')

    const userData = {
      username: 'unique_test_user',
      email: 'unique1@test.com',
      password: 'Test123456'
    }

    await allure.step('Create first user', async () => {
      await apiHelper.post('/users/register', userData)
    })

    await allure.step('Try to create duplicate username', async () => {
      const duplicateUser = {
        ...userData,
        email: 'different@test.com'
      }
      
      const response = await apiHelper.post('/users/register', duplicateUser)
      
      await allure.step('Verify rejection', async () => {
        expect(response.status).toBe(409)
        expect(response.data.message).toContain('already exists')
      })
    })
  })

  test('should hash password in database @db @user @security', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Password Hashing')
    await allure.severity('blocker')
    await allure.tag('@db', '@user', '@security')

    const userData = {
      username: 'password_hash_test',
      email: 'hash@test.com',
      password: 'Test123456'
    }

    await allure.step('Create user via API', async () => {
      await apiHelper.post('/users/register', userData)
    })

    await allure.step('Verify password is hashed in DB', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.hashedPassword).toBeTruthy()
      expect(userInDB.hashedPassword).not.toBe(userData.password)
      expect(userInDB.hashedPassword).toMatch(/^\$2[aby]\$/) // bcrypt format
      
      await allure.parameter('Hashed Password', userInDB.hashedPassword.substring(0, 30) + '...')
    })
  })

  test('should store reset token as hashed @db @user @security', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Reset Token Hashing')
    await allure.severity('critical')
    await allure.tag('@db', '@user', '@security')

    const { userData } = await authHelper.createTestUser()

    await allure.step('Request password reset', async () => {
      await authHelper.requestPasswordReset(userData.email)
    })

    await allure.step('Verify reset token is hashed in DB', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.hashedResetToken).toBeTruthy()
      expect(userInDB.hashedResetToken).toHaveLength(64) // SHA256 produces 64 char hex
      expect(userInDB.resetTokenExpiry).toBeTruthy()
      
      await allure.parameter('Hashed Token Length', userInDB.hashedResetToken.length.toString())
      await allure.parameter('Token Expiry', userInDB.resetTokenExpiry)
    })
  })

  test('should store refresh token @db @user @auth', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Refresh Token Storage')
    await allure.severity('critical')
    await allure.tag('@db', '@user', '@auth')

    const { userData } = await authHelper.createAndLoginTestUser()

    await allure.step('Verify refresh token stored in DB', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.refreshToken).toBeTruthy()
      expect(userInDB.refreshTokenExpiry).toBeTruthy()
      
      await allure.parameter('Has Refresh Token', 'Yes')
      await allure.parameter('Token Expiry', userInDB.refreshTokenExpiry)
    })
  })

  test('should clear refresh token on logout @db @user @auth', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Logout Token Cleanup')
    await allure.severity('normal')
    await allure.tag('@db', '@user', '@auth')

    const { userData } = await authHelper.createAndLoginTestUser()

    await allure.step('Logout user', async () => {
      await authHelper.logoutUser()
    })

    await allure.step('Verify refresh token cleared from DB', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.refreshToken).toBeNull()
      expect(userInDB.refreshTokenExpiry).toBeNull()
    })
  })

  test('should have proper timestamps @db @user', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Timestamps')
    await allure.severity('minor')
    await allure.tag('@db', '@user')

    const { userData } = await authHelper.createTestUser()

    await allure.step('Verify timestamps exist', async () => {
      const userInDB = dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.createdAt).toBeTruthy()
      expect(userInDB.updatedAt).toBeTruthy()
      
      const createdAt = new Date(userInDB.createdAt)
      const updatedAt = new Date(userInDB.updatedAt)
      
      expect(createdAt).toBeInstanceOf(Date)
      expect(updatedAt).toBeInstanceOf(Date)
    })
  })
})

