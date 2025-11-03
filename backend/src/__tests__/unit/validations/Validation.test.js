const {
  validateEmail,
  validatePassword,
  validateUsername,
  validateAge,
  validateRole,
  validateTodoData,
  validateTodoUpdate,
  validateId
} = require('../../../api/validations/Validation')

describe('Validation Functions', () => {
  describe('validateEmail', () => {
    it('should pass for valid email', () => {
      expect(() => validateEmail('test@example.com')).not.toThrow()
    })

    it('should throw for invalid email', () => {
      expect(() => validateEmail('invalid-email')).toThrow('Valid email address is required')
      expect(() => validateEmail('')).toThrow()
      expect(() => validateEmail(null)).toThrow()
    })
  })

  describe('validatePassword', () => {
    it('should pass for valid password', () => {
      expect(() => validatePassword('password123')).not.toThrow()
    })

    it('should throw for short password', () => {
      expect(() => validatePassword('12345')).toThrow('Password must be at least 6 characters long')
    })

    it('should throw for empty password', () => {
      expect(() => validatePassword('')).toThrow()
      expect(() => validatePassword(null)).toThrow()
    })
  })

  describe('validateUsername', () => {
    it('should pass for valid username', () => {
      expect(() => validateUsername('testuser')).not.toThrow()
      expect(() => validateUsername('test_user-123')).not.toThrow()
    })

    it('should throw for short username', () => {
      expect(() => validateUsername('ab')).toThrow('Username must be at least 3 characters long')
    })

    it('should throw for invalid characters', () => {
      expect(() => validateUsername('')).toThrow()
      expect(() => validateUsername(null)).toThrow()
    })
  })

  describe('validateAge', () => {
    it('should pass for valid age', () => {
      expect(() => validateAge(25)).not.toThrow()
      expect(() => validateAge(1)).not.toThrow()
      expect(() => validateAge(120)).not.toThrow()
    })

    it('should throw for invalid age', () => {
      expect(() => validateAge(0)).toThrow()
      expect(() => validateAge(121)).toThrow()
      expect(() => validateAge(-5)).toThrow()
    })

    it('should pass for null/undefined (optional)', () => {
      expect(() => validateAge(null)).not.toThrow()
      expect(() => validateAge(undefined)).not.toThrow()
    })
  })

  describe('validateRole', () => {
    it('should pass for valid roles', () => {
      expect(() => validateRole('client')).not.toThrow()
      expect(() => validateRole('admin')).not.toThrow()
    })

    it('should throw for invalid role', () => {
      expect(() => validateRole('superadmin')).toThrow('Invalid role. Must be client or admin')
      expect(() => validateRole('user')).toThrow()
    })

    it('should pass for null/undefined (optional)', () => {
      expect(() => validateRole(null)).not.toThrow()
      expect(() => validateRole(undefined)).not.toThrow()
    })
  })

  describe('validateTodoData', () => {
    it('should pass for valid todo data', () => {
      expect(() => validateTodoData({ title: 'Valid Title' })).not.toThrow()
    })

    it('should throw for empty title', () => {
      expect(() => validateTodoData({ title: '' })).toThrow()
      expect(() => validateTodoData({ title: '   ' })).toThrow()
    })

    it('should throw for missing title', () => {
      expect(() => validateTodoData({})).toThrow('Todo title is required')
    })

    it('should throw for too long title', () => {
      const longTitle = 'a'.repeat(256)
      expect(() => validateTodoData({ title: longTitle })).toThrow('Todo title must not exceed 255 characters')
    })
  })

  describe('validateTodoUpdate', () => {
    it('should pass for valid update data', () => {
      expect(() => validateTodoUpdate({ title: 'Updated' })).not.toThrow()
      expect(() => validateTodoUpdate({ description: 'Updated desc' })).not.toThrow()
      expect(() => validateTodoUpdate({ completed: true })).not.toThrow()
    })

    it('should throw for invalid completed value', () => {
      expect(() => validateTodoUpdate({ completed: 'yes' })).toThrow('Completed must be a boolean')
    })

    it('should throw for empty title', () => {
      expect(() => validateTodoUpdate({ title: '' })).toThrow()
    })

    it('should throw for invalid data type', () => {
      expect(() => validateTodoUpdate(null)).toThrow('Invalid update payload')
      expect(() => validateTodoUpdate('string')).toThrow()
    })
  })

  describe('validateId', () => {
    it('should return valid numeric ID', () => {
      expect(validateId('1')).toBe(1)
      expect(validateId('123')).toBe(123)
      expect(validateId(456)).toBe(456)
    })

    it('should throw for invalid ID', () => {
      expect(() => validateId('abc')).toThrow('Invalid ID format')
      expect(() => validateId('0')).toThrow()
      expect(() => validateId('-1')).toThrow()
      expect(() => validateId(null)).toThrow()
    })
  })
})

