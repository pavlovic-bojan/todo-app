<template>
  <div v-if="hasError" class="error-boundary">
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card border-danger">
            <div class="card-header bg-danger text-white">
              <h4 class="mb-0">
                <i class="bi bi-exclamation-triangle"></i>
                Something went wrong
              </h4>
            </div>
            <div class="card-body">
              <p class="card-text">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              
              <div v-if="showDetails" class="alert alert-light mt-3">
                <h6>Error Details:</h6>
                <pre class="mb-0"><code>{{ errorInfo }}</code></pre>
              </div>

              <div class="mt-3">
                <button
                  class="btn btn-primary me-2"
                  @click="handleReload"
                >
                  Reload Page
                </button>
                <button
                  class="btn btn-outline-secondary me-2"
                  @click="handleGoHome"
                >
                  Go Home
                </button>
                <button
                  v-if="!showDetails"
                  class="btn btn-outline-info"
                  @click="showDetails = true"
                >
                  Show Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <slot v-else></slot>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const hasError = ref(false)
const errorInfo = ref('')
const showDetails = ref(false)

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  errorInfo.value = `${err.toString()}\n\nComponent: ${info}`
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.error('Error caught by ErrorBoundary:', err)
    console.error('Component info:', info)
  }
  
  // In production, you might want to send this to an error tracking service
  // e.g., Sentry, LogRocket, etc.
  
  // Prevent error from propagating
  return false
})

const handleReload = () => {
  window.location.reload()
}

const handleGoHome = () => {
  hasError.value = false
  router.push('/')
}

const reset = () => {
  hasError.value = false
  errorInfo.value = ''
  showDetails.value = false
}

// Expose reset method for parent components
defineExpose({ reset })
</script>

<style scoped>
.error-boundary pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
}
</style>

