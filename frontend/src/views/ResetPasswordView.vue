<template>
  <div class="container">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <div class="row justify-content-center mt-5">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-body p-5">
            <h1 class="h2 text-center mb-4">Reset Password</h1>
            
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

            <form v-if="!successMessage" @submit.prevent="handleResetPassword" novalidate>
              <div class="mb-3">
                <label for="resetToken" class="form-label">
                  Reset Token <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="resetToken"
                  v-model="formData.resetToken"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.resetToken }"
                  placeholder="Enter the token you received"
                  required
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.resetToken"
                  :aria-describedby="errors.resetToken ? 'token-error token-help' : 'token-help'"
                  @input="clearError('resetToken')"
                  @blur="validateField('resetToken')"
                />
                <small id="token-help" class="text-muted">
                  Enter the reset token from the forgot password page
                </small>
                <div
                  v-if="errors.resetToken"
                  id="token-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.resetToken }}
                </div>
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">
                  New Password <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="newPassword"
                  v-model="formData.newPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.newPassword }"
                  placeholder="Enter new password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.newPassword"
                  :aria-describedby="errors.newPassword ? 'password-error password-help' : 'password-help'"
                  @input="clearError('newPassword')"
                  @blur="validateField('newPassword')"
                />
                <small id="password-help" class="text-muted">
                  At least 6 characters with uppercase, lowercase, and number
                </small>
                <div
                  v-if="errors.newPassword"
                  id="password-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.newPassword }}
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">
                  Confirm Password <span class="text-danger" aria-label="required">*</span>
                </label>
                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': errors.confirmPassword }"
                  placeholder="Confirm new password"
                  required
                  minlength="6"
                  autocomplete="new-password"
                  :disabled="authStore.loading"
                  :aria-invalid="!!errors.confirmPassword"
                  :aria-describedby="errors.confirmPassword ? 'confirm-error' : undefined"
                  @input="clearError('confirmPassword')"
                  @blur="validateField('confirmPassword')"
                />
                <div
                  v-if="errors.confirmPassword"
                  id="confirm-error"
                  class="invalid-feedback"
                  role="alert"
                >
                  {{ errors.confirmPassword }}
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
                  <span>{{ authStore.loading ? 'Resetting...' : 'Reset Password' }}</span>
                </button>
              </div>
            </form>

            <div v-if="successMessage" class="d-grid mt-3">
              <router-link to="/login" class="btn btn-success">
                Go to Login
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

const authStore = useAuthStore()
const { validators, errors, validate, clearError, validateAll } = useFormValidation()

const formData = ref({
  resetToken: '',
  newPassword: ''
})

const confirmPassword = ref('')
const successMessage = ref('')

const validateField = (field) => {
  if (field === 'resetToken') {
    validate('resetToken', formData.value.resetToken, [
      (val) => validators.required(val, 'Reset token')
    ])
  } else if (field === 'newPassword') {
    validate('newPassword', formData.value.newPassword, [
      (val) => validators.required(val, 'Password'),
      validators.strongPassword
    ])
  } else if (field === 'confirmPassword') {
    validate('confirmPassword', confirmPassword.value, [
      (val) => validators.required(val, 'Confirm password'),
      (val) => validators.match(val, formData.value.newPassword, 'Passwords')
    ])
  }
}

const handleResetPassword = async () => {
  authStore.error = null

  // Validate all fields
  const isValid = validateAll({
    resetToken: {
      value: formData.value.resetToken,
      rules: [(val) => validators.required(val, 'Reset token')]
    },
    newPassword: {
      value: formData.value.newPassword,
      rules: [
        (val) => validators.required(val, 'Password'),
        validators.strongPassword
      ]
    },
    confirmPassword: {
      value: confirmPassword.value,
      rules: [
        (val) => validators.required(val, 'Confirm password'),
        (val) => validators.match(val, formData.value.newPassword, 'Passwords')
      ]
    }
  })

  if (!isValid) return

  try {
    const response = await authStore.resetPassword(formData.value)
    successMessage.value = response.message
  } catch (error) {
    console.error('Reset password failed:', error)
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
