<template>
  <div class="container">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-body p-5">
            <h1 class="h2 text-center mb-4">Login</h1>
            
            <div
              v-if="authStore.error"
              class="alert alert-danger"
              role="alert"
              aria-live="polite"
            >
              {{ authStore.error }}
            </div>

            <form @submit.prevent="handleLogin" novalidate>
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
                  placeholder="Enter your username"
                  required
                  autocomplete="username"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.username"
                  :aria-describedby="errors.username ? 'username-error' : undefined"
                  @input="clearError('username')"
                  @blur="validateField('username')"
                />
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
                <label for="password" class="form-label">
                  Password <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="password"
                  v-model="formData.password"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.password }"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="errors.password ? 'password-error' : undefined"
                  @input="clearError('password')"
                  @blur="validateField('password')"
                />
                <div
                  v-if="errors.password"
                  id="password-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.password }}
                </div>
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
                  <span>{{ authStore.loading ? 'Logging in...' : 'Login' }}</span>
                </button>
              </div>
            </form>

            <div class="text-center mt-3">
              <router-link
                to="/forgot-password"
                class="text-decoration-none"
              >
                Forgot Password?
              </router-link>
            </div>

            <hr class="my-4" aria-hidden="true" />

            <div class="text-center">
              <p class="mb-0">Don't have an account?</p>
              <router-link to="/register" class="btn btn-outline-secondary mt-2">
                Register
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
  password: ''
})

const validateField = (field) => {
  if (field === 'username') {
    validate('username', formData.value.username, [
      (val) => validators.required(val, 'Username'),
      validators.username
    ])
  } else if (field === 'password') {
    validate('password', formData.value.password, [
      (val) => validators.required(val, 'Password')
    ])
  }
}

const handleLogin = async () => {
  authStore.error = null
  
  // Validate all fields
  const isValid = validateAll({
    username: {
      value: formData.value.username,
      rules: [
        (val) => validators.required(val, 'Username'),
        validators.username
      ]
    },
    password: {
      value: formData.value.password,
      rules: [(val) => validators.required(val, 'Password')]
    }
  })

  if (!isValid) return

  try {
    // Sanitize input before sending
    const sanitizedData = {
      username: sanitizeInput(formData.value.username),
      password: formData.value.password // Don't sanitize password
    }

    await authStore.login(sanitizedData)
    router.push('/dashboard')
  } catch (error) {
    console.error('Login failed:', error)
    // Error is already set in the store
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
