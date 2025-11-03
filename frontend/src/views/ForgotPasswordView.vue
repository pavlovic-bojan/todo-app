<template>
  <div class="container">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-body p-5">
            <h1 class="h2 text-center mb-4">Forgot Password</h1>
            
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
              <div v-if="resetToken" class="mt-3">
                <strong>Reset Token:</strong>
                <div class="bg-light p-2 rounded mt-1">
                  <code>{{ resetToken }}</code>
                </div>
                <small class="text-muted">Copy this token for password reset</small>
              </div>
            </div>

            <form v-if="!successMessage" @submit.prevent="handleForgotPassword" novalidate>
              <p class="text-muted mb-4">
                Enter your email address and we'll send you a password reset token.
              </p>

              <div class="mb-3">
                <label for="email" class="form-label">
                  Email <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="email"
                  v-model="email"
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
                  @blur="validateEmail"
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
                  <span>{{ authStore.loading ? 'Sending...' : 'Send Reset Token' }}</span>
                </button>
              </div>
            </form>

            <div v-if="successMessage && resetToken" class="d-grid mt-3">
              <router-link to="/reset-password" class="btn btn-success">
                Go to Reset Password
              </router-link>
            </div>

            <hr class="my-4" aria-hidden="true" />

            <div class="text-center">
              <router-link to="/login" class="text-decoration-none">
                Back to Login
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
import { useAuthStore } from '@/stores/auth'
import { useFormValidation } from '@/composables/useFormValidation'
import { useSanitize } from '@/composables/useSanitize'

const authStore = useAuthStore()
const { validators, errors, validate, clearError } = useFormValidation()
const { sanitizeInput } = useSanitize()

const email = ref('')
const successMessage = ref('')
const resetToken = ref('')

const validateEmail = () => {
  validate('email', email.value, [
    (val) => validators.required(val, 'Email'),
    validators.email
  ])
}

const handleForgotPassword = async () => {
  authStore.error = null
  
  // Validate email
  validateEmail()
  if (errors.value.email) return

  try {
    const sanitizedEmail = sanitizeInput(email.value)
    const response = await authStore.forgotPassword(sanitizedEmail)
    resetToken.value = response.resetToken
    successMessage.value = response.message
  } catch (error) {
    console.error('Forgot password failed:', error)
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
