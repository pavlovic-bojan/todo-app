<template>
  <ErrorBoundary>
    <div id="app">
      <Navbar />
      <router-view />
    </div>
  </ErrorBoundary>
</template>

<script setup>
import { onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initAuth()
})
</script>

<style>
#app {
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Focus visible for accessibility */
*:focus-visible {
  outline: 2px solid #0d6efd;
  outline-offset: 2px;
}

/* Skip to main content link for screen readers */
.skip-to-main {
  position: absolute;
  left: -9999px;
  z-index: 999;
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
}
</style>
