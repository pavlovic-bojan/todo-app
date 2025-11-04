import { describe, it, expect, beforeEach } from 'vitest'
import { useFormValidation } from '@/composables/useFormValidation'

describe('useFormValidation', () => {
  let validation

  beforeEach(() => {
    validation = useFormValidation()
  })

  describe('validators.required', () => {
    it('should pass for non-empty value', () => {
      expect(validation.validators.required('test', 'Field')).toBeNull()
    })

    it('should fail for empty string', () => {
      expect(validation.validators.required('', 'Field')).toBe('Field is required')
    })

    it('should fail for whitespace only', () => {
      expect(validation.validators.required('   ', 'Field')).toBe('Field is required')
    })

    it('should fail for null/undefined', () => {
      expect(validation.validators.required(null, 'Field')).toBe('Field is required')
      expect(validation.validators.required(undefined, 'Field')).toBe('Field is required')
    })
  })

  describe('validators.email', () => {
    it('should pass for valid email', () => {
      expect(validation.validators.email('test@example.com')).toBeNull()
      expect(validation.validators.email('user.name+tag@domain.co.uk')).toBeNull()
    })

    it('should fail for invalid email', () => {
      expect(validation.validators.email('invalid')).toBe('Please enter a valid email address')
      expect(validation.validators.email('test@')).toBe('Please enter a valid email address')
      expect(validation.validators.email('@example.com')).toBe('Please enter a valid email address')
    })

    it('should pass for empty value (optional)', () => {
      expect(validation.validators.email('')).toBeNull()
      expect(validation.validators.email(null)).toBeNull()
    })
  })

  describe('validators.minLength', () => {
    it('should pass for valid length', () => {
      expect(validation.validators.minLength('test', 3, 'Field')).toBeNull()
      expect(validation.validators.minLength('testing', 5, 'Field')).toBeNull()
    })

    it('should fail for too short value', () => {
      expect(validation.validators.minLength('ab', 3, 'Field')).toBe('Field must be at least 3 characters long')
    })
  })

  describe('validators.strongPassword', () => {
    it('should pass for strong password', () => {
      expect(validation.validators.strongPassword('Password123')).toBeNull()
      expect(validation.validators.strongPassword('Test1234')).toBeNull()
    })

    it('should fail for weak password - no uppercase', () => {
      const result = validation.validators.strongPassword('password123')
      expect(result).toContain('uppercase')
    })

    it('should fail for weak password - no lowercase', () => {
      const result = validation.validators.strongPassword('PASSWORD123')
      expect(result).toContain('lowercase')
    })

    it('should fail for weak password - no number', () => {
      const result = validation.validators.strongPassword('Password')
      expect(result).toContain('number')
    })

    it('should fail for weak password - too short', () => {
      const result = validation.validators.strongPassword('Pas1')
      expect(result).toContain('6 characters')
    })
  })

  describe('validators.match', () => {
    it('should pass when values match', () => {
      expect(validation.validators.match('password', 'password', 'Passwords')).toBeNull()
    })

    it('should fail when values do not match', () => {
      expect(validation.validators.match('password1', 'password2', 'Passwords'))
        .toBe('Passwords do not match')
    })
  })

  describe('validators.username', () => {
    it('should pass for valid username', () => {
      expect(validation.validators.username('testuser')).toBeNull()
      expect(validation.validators.username('test_user-123')).toBeNull()
    })

    it('should fail for invalid characters', () => {
      expect(validation.validators.username('test user')).toContain('letters, numbers')
      expect(validation.validators.username('test@user')).toContain('letters, numbers')
    })
  })

  describe('validate function', () => {
    it('should validate field and set error', () => {
      const isValid = validation.validate('email', 'invalid', [validation.validators.email])
      
      expect(isValid).toBe(false)
      expect(validation.errors.value.email).toBeDefined()
    })

    it('should validate field and clear error for valid input', () => {
      validation.validate('email', 'test@example.com', [validation.validators.email])
      
      expect(validation.errors.value.email).toBeNull()
    })
  })

  describe('validateAll function', () => {
    it('should validate all fields', () => {
      const fields = {
        email: {
          value: 'test@example.com',
          rules: [validation.validators.email]
        },
        password: {
          value: 'Password123',
          rules: [validation.validators.strongPassword]
        }
      }

      const isValid = validation.validateAll(fields)

      expect(isValid).toBe(true)
      // hasErrors checks if there are any non-null errors
      const actualErrors = Object.values(validation.errors.value).filter(e => e !== null)
      expect(actualErrors.length).toBe(0)
    })

    it('should return false if any field is invalid', () => {
      const fields = {
        email: {
          value: 'invalid',
          rules: [validation.validators.email]
        },
        password: {
          value: 'weak',
          rules: [validation.validators.strongPassword]
        }
      }

      const isValid = validation.validateAll(fields)

      expect(isValid).toBe(false)
      expect(validation.hasErrors.value).toBe(true)
    })
  })

  describe('clearErrors', () => {
    it('should clear all errors', () => {
      validation.errors.value = { email: 'Error', password: 'Error' }
      validation.clearErrors()

      expect(validation.errors.value).toEqual({})
    })
  })

  describe('getError', () => {
    it('should return error for field', () => {
      validation.errors.value = { email: 'Email error' }
      
      expect(validation.getError('email')).toBe('Email error')
      expect(validation.getError('password')).toBeNull()
    })
  })
})

