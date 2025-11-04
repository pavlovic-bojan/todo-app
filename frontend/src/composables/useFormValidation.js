import { ref, computed } from 'vue'

export function useFormValidation() {
  const errors = ref({})

  const hasErrors = computed(() => {
    return Object.values(errors.value).some(error => error !== null && error !== undefined)
  })

  const validators = {
    required: (value, fieldName = 'This field') => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} is required`
      }
      return null
    },

    email: (value) => {
      if (!value) return null
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address'
      }
      return null
    },

    minLength: (value, min, fieldName = 'This field') => {
      if (!value) return null
      if (value.length < min) {
        return `${fieldName} must be at least ${min} characters long`
      }
      return null
    },

    maxLength: (value, max, fieldName = 'This field') => {
      if (!value) return null
      if (value.length > max) {
        return `${fieldName} must not exceed ${max} characters`
      }
      return null
    },

    strongPassword: (value) => {
      if (!value) return null
      
      const errors = []
      if (value.length < 6) {
        errors.push('at least 6 characters')
      }
      if (!/[a-z]/.test(value)) {
        errors.push('one lowercase letter')
      }
      if (!/[A-Z]/.test(value)) {
        errors.push('one uppercase letter')
      }
      if (!/\d/.test(value)) {
        errors.push('one number')
      }

      if (errors.length > 0) {
        return `Password must contain ${errors.join(', ')}`
      }
      return null
    },

    match: (value, compareValue, fieldName = 'Passwords') => {
      if (value !== compareValue) {
        return `${fieldName} do not match`
      }
      return null
    },

    username: (value) => {
      if (!value) return null
      const usernameRegex = /^[a-zA-Z0-9_-]+$/
      if (!usernameRegex.test(value)) {
        return 'Username can only contain letters, numbers, underscores and hyphens'
      }
      return null
    },

    number: (value, fieldName = 'This field') => {
      if (!value) return null
      if (isNaN(value)) {
        return `${fieldName} must be a number`
      }
      return null
    },

    min: (value, min, fieldName = 'This field') => {
      if (!value) return null
      if (Number(value) < min) {
        return `${fieldName} must be at least ${min}`
      }
      return null
    },

    max: (value, max, fieldName = 'This field') => {
      if (!value) return null
      if (Number(value) > max) {
        return `${fieldName} must not exceed ${max}`
      }
      return null
    }
  }

  const validate = (field, value, rules) => {
    errors.value[field] = null

    for (const rule of rules) {
      const error = rule(value)
      if (error) {
        errors.value[field] = error
        break
      }
    }

    return !errors.value[field]
  }

  const validateAll = (fields) => {
    let isValid = true
    errors.value = {}

    Object.keys(fields).forEach(fieldName => {
      const { value, rules } = fields[fieldName]
      const valid = validate(fieldName, value, rules)
      if (!valid) isValid = false
    })

    return isValid
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearError = (field) => {
    delete errors.value[field]
  }

  const getError = (field) => {
    return errors.value[field] || null
  }

  return {
    errors,
    hasErrors,
    validators,
    validate,
    validateAll,
    clearErrors,
    clearError,
    getError
  }
}

