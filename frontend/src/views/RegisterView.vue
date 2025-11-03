<template>
  <div class="container">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <div class="row justify-content-center mt-5">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-body p-5">
            <h1 class="h2 text-center mb-4">Register</h1>
            
            <div
              v-if="authStore.error"
              class="alert alert-danger"
              role="alert"
              aria-live="polite"
            >
              {{ authStore.error }}
            </div>

            <div
              v-if="successMessage"
              class="alert alert-success"
              role="alert"
              aria-live="polite"
            >
              {{ successMessage }}
            </div>

            <form @submit.prevent="handleRegister" novalidate>
              <div class="mb-3">
                <label for="username" class="form-label">
                  Username <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.username }"
                  placeholder="Choose a username"
                  required
                  minlength="3"
                  autocomplete="username"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.username"
                  :aria-describedby="errors.username ? 'username-error username-help' : 'username-help'"
                  @input="clearError('username')"
                  @blur="validateField('username')"
                />
                <small id="username-help" class="text-muted">
                  At least 3 characters, only letters, numbers, underscores and hyphens
                </small>
                <div
                  v-if="errors.username"
                  id="username-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.username }}
                </div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">
                  Email <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="email"
                  v-model="formData.email"
                  type="email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  placeholder="your@email.com"
                  required
                  autocomplete="email"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.email"
                  :aria-describedby="errors.email ? 'email-error' : undefined"
                  @input="clearError('email')"
                  @blur="validateField('email')"
                />
                <div
                  v-if="errors.email"
                  id="email-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.email }}
                </div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">
                  Password <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Choose a strong password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="errors.password ? 'password-error password-help' : 'password-help'"
                  @input="clearError('password')"
                  @blur="validateField('password')"
                />
                <small id="password-help" class="text-muted">
                  At least 6 characters with uppercase, lowercase, and number
                </small>
                <div
                  v-if="errors.password"
                  id="password-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.password }}
                </div>
              </div>

              <div class="mb-3">
                <label for="age" class="form-label">
                  Age (optional)
                </label>
                <input
                  id="age"
                  v-model.number="formData.age"
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.age }"
                  placeholder="Your age"
                  min="1"
                  max="120"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.age"
                  :aria-describedby="errors.age ? 'age-error' : undefined"
                  @input="clearError('age')"
                  @blur="validateField('age')"
                />
                <div
                  v-if="errors.age"
                  id="age-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.age }}
                </div>
              </div>

              <div class="mb-3">
                <label for="role" class="form-label">
                  Role
                </label>
                <select
                  id="role"
                  v-model="formData.role"
                  class="form-select"
                  :disabled="authStore.loading"
                  aria-label="Select user role"
                >
                  <option value="client">Client</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="d-grid">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="authStore.loading"
                  :aria-busy="authStore.loading"
                >
                  <span
                    v-if="authStore.loading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  <span>{{ authStore.loading ? 'Registering...' : 'Register' }}</span>
                </button>
              </div>
            </form>

            <hr class="my-4" aria-hidden="true" />

            <div class="text-center">
              <p class="mb-0">Already have an account?</p>
              <router-link to="/login" class="btn btn-outline-secondary mt-2">
                Login
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFormValidation } from '@/composables/useFormValidation'
import { useSanitize } from '@/composables/useSanitize'

const router = useRouter()
const authStore = useAuthStore()
const { validators, errors, validate, clearError, validateAll } = useFormValidation()
const { sanitizeInput } = useSanitize()

const formData = ref({
  username: '',
  email: '',
  password: '',
  age: null,
  role: 'client'
})

const successMessage = ref('')

const validateField = (field) => {
  const validationRules = {
    username: [
      (val) => validators.required(val, 'Username'),
      (val) => validators.minLength(val, 3, 'Username'),
      validators.username
    ],
    email: [
      (val) => validators.required(val, 'Email'),
      validators.email
    ],
    password: [
      (val) => validators.required(val, 'Password'),
      validators.strongPassword
    ],
    age: [
      (val) => val ? validators.min(val, 1, 'Age') : null,
      (val) => val ? validators.max(val, 120, 'Age') : null
    ]
  }

  if (validationRules[field]) {
    validate(field, formData.value[field], validationRules[field])
  }
}

const handleRegister = async () => {
  authStore.error = null
  successMessage.value = ''

  // Validate all required fields
  const isValid = validateAll({
    username: {
      value: formData.value.username,
      rules: [
        (val) => validators.required(val, 'Username'),
        (val) => validators.minLength(val, 3, 'Username'),
        validators.username
      ]
    },
    email: {
      value: formData.value.email,
      rules: [
        (val) => validators.required(val, 'Email'),
        validators.email
      ]
    },
    password: {
      value: formData.value.password,
      rules: [
        (val) => validators.required(val, 'Password'),
        validators.strongPassword
      ]
    }
  })

  if (!isValid) return

  // Validate age if provided
  if (formData.value.age) {
    validateField('age')
    if (errors.value.age) return
  }

  try {
    const data = {
      username: sanitizeInput(formData.value.username),
      email: sanitizeInput(formData.value.email),
      password: formData.value.password, // Don't sanitize password
      role: formData.value.role
    }

    if (formData.value.age) {
      data.age = formData.value.age
    }

    await authStore.register(data)
    successMessage.value = 'Registration successful! Redirecting to login...'

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Registration failed:', error)
  }
}
</script>

<style scoped>
.card {
  border: none;
}

.skip-to-main {
  position: absolute;
  left: -9999px;
}

.skip-to-main:focus {
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  background: #0d6efd;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  z-index: 9999;
}
</style>
