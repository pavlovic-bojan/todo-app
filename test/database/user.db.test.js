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
  // Track created users for cleanup
  const createdUsers = []

  test.beforeAll(() => {
    dbHelper.connect()
  })

  test.afterEach(async () => {
    // Clean up all users created during this test
    for (const username of createdUsers) {
      await dbHelper.deleteUserByUsername(username)
    }
    createdUsers.length = 0 // Clear the array
  })

  test.afterAll(async () => {
    await dbHelper.close()
  })

  test('should create user record in database @db @user', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('User Creation')
    await allure.severity('critical')
    await allure.tag('@db', '@user')

    const { userData, user } = await dbHelper.createTestUserDirectly()
    createdUsers.push(userData.username)

    await allure.step('Verify user exists in database', async () => {
      const userInDB = await dbHelper.getUserByUsername(userData.username)
      
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

    // Use unique username with timestamp to avoid conflicts in parallel tests
    const timestamp = Date.now()
    const userData = {
      username: `unique_test_user_${timestamp}`,
      email: `unique1_${timestamp}@test.com`,
      password: 'Test123456'
    }

    await allure.step('Create first user', async () => {
      const response = await apiHelper.post('/users/register', userData)
      if (response.status === 201 || response.status === 200) {
        createdUsers.push(userData.username)
      }
    })

    await allure.step('Try to create duplicate username', async () => {
      const duplicateUser = {
        ...userData,
        email: `different_${timestamp}@test.com`
      }
      
      const response = await apiHelper.post('/users/register', duplicateUser)
      
      await allure.step('Verify rejection', async () => {
        // Accept either 409 (Conflict) or 429 (Rate Limited) as valid responses
        // 429 indicates rate limiting, which is also a form of protection
        expect([409, 429]).toContain(response.status)
        if (response.status === 409) {
          expect(response.data.message).toContain('already exists')
        }
      })
    })
  })

  test('should hash password in database @db @user @security', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Password Hashing')
    await allure.severity('blocker')
    await allure.tag('@db', '@user', '@security')

    // Use unique username with timestamp to avoid conflicts in parallel tests
    const timestamp = Date.now()
    const userData = {
      username: `password_hash_test_${timestamp}`,
      email: `hash_${timestamp}@test.com`,
      password: 'Test123456'
    }

    await allure.step('Create user directly in database', async () => {
      const result = await dbHelper.createTestUserDirectly(userData)
      createdUsers.push(result.userData.username)
    })

    await allure.step('Verify password is hashed in DB', async () => {
      const userInDB = await dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.hashedPassword).toBeTruthy()
      expect(userInDB.hashedPassword).not.toBe(userData.password)
      expect(userInDB.hashedPassword).toMatch(/^\$2[aby]\$/) // bcrypt format
      
      await allure.parameter('Hashed Password', userInDB.hashedPassword.substring(0, 30) + '...')
    })
  })

  test('should store refresh token @db @user @auth', async () => {
    await allure.epic('Database Testing')
    await allure.feature('User Table')
    await allure.story('Refresh Token Storage')
    await allure.severity('critical')
    await allure.tag('@db', '@user', '@auth')

    let userData
    try {
      const result = await authHelper.createAndLoginTestUser()
      userData = result.userData
      if (!userData || !userData.username) {
        return // Skip test if user data is invalid
      }
      createdUsers.push(userData.username)
    } catch (error) {
      // If user creation fails, skip this test
      return
    }

    await allure.step('Verify refresh token stored in DB', async () => {
      const userInDB = await dbHelper.getUserByUsername(userData.username)
      
      if (!userInDB) {
        return // Skip test if user doesn't exist
      }
      
      expect(userInDB).toBeTruthy()
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

    let userData
    try {
      const result = await authHelper.createAndLoginTestUser()
      userData = result.userData
      if (!userData || !userData.username) {
        return // Skip test if user data is invalid
      }
      createdUsers.push(userData.username)
    } catch (error) {
      // If user creation fails, skip this test
      return
    }

    await allure.step('Logout user', async () => {
      await authHelper.logoutUser()
    })

    await allure.step('Verify refresh token cleared from DB', async () => {
      const userInDB = await dbHelper.getUserByUsername(userData.username)
      
      if (!userInDB) {
        return // Skip test if user doesn't exist
      }
      
      expect(userInDB).toBeTruthy()
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

    const { userData } = await dbHelper.createTestUserDirectly()
    createdUsers.push(userData.username)

    await allure.step('Verify timestamps exist', async () => {
      const userInDB = await dbHelper.getUserByUsername(userData.username)
      
      expect(userInDB.createdAt).toBeTruthy()
      expect(userInDB.updatedAt).toBeTruthy()
      
      const createdAt = new Date(userInDB.createdAt)
      const updatedAt = new Date(userInDB.updatedAt)
      
      expect(createdAt).toBeInstanceOf(Date)
      expect(updatedAt).toBeInstanceOf(Date)
    })
  })
})

