/**
 * Data Generator
 * Generates random test data
 */
const { faker } = require('@faker-js/faker')

class DataGenerator {
  /**
   * Generate random user data
   */
  generateUser(overrides = {}) {
    const timestamp = Date.now()
    return {
      username: overrides.username || `user_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
      email: overrides.email || faker.internet.email(),
      password: overrides.password || this.generateStrongPassword(),
      role: overrides.role || 'client',
      age: overrides.age || faker.number.int({ min: 18, max: 80 }),
      ...overrides
    }
  }

  /**
   * Generate random todo data
   */
  generateTodo(overrides = {}) {
    return {
      title: overrides.title || faker.lorem.sentence({ min: 3, max: 8 }),
      description: overrides.description || faker.lorem.paragraph(),
      completed: overrides.completed || false,
      ...overrides
    }
  }

  /**
   * Generate strong password
   */
  generateStrongPassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    
    let password = ''
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += this.randomString(5, lowercase + uppercase + numbers)
    
    return this.shuffleString(password)
  }

  /**
   * Generate random string
   */
  randomString(length, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
    return result
  }

  /**
   * Shuffle string
   */
  shuffleString(str) {
    return str.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * Generate random email
   */
  randomEmail() {
    return faker.internet.email()
  }

  /**
   * Generate random number
   */
  randomNumber(min = 1, max = 100) {
    return faker.number.int({ min, max })
  }

  /**
   * Generate multiple users
   */
  generateUsers(count, overrides = {}) {
    const users = []
    for (let i = 0; i < count; i++) {
      users.push(this.generateUser(overrides))
    }
    return users
  }

  /**
   * Generate multiple todos
   */
  generateTodos(count, overrides = {}) {
    const todos = []
    for (let i = 0; i < count; i++) {
      todos.push(this.generateTodo(overrides))
    }
    return todos
  }
}

module.exports = new DataGenerator()

