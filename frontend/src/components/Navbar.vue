<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary" role="navigation" aria-label="Main navigation">
    <div class="container-fluid">
      <router-link class="navbar-brand" to="/" aria-label="Todo App Home">
        <span aria-hidden="true">📋</span> Todo App
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <template v-if="authStore.isAuthenticated">
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/dashboard"
                aria-label="Go to dashboard"
              >
                Dashboard
              </router-link>
            </li>
            <li class="nav-item">
              <span class="nav-link" aria-label="Current user">
                Hello, <strong>{{ authStore.user?.username }}</strong>
              </span>
            </li>
            <li class="nav-item">
              <button
                class="btn btn-outline-light btn-sm"
                @click="handleLogout"
                aria-label="Logout from your account"
              >
                Logout
              </button>
            </li>
          </template>
          <template v-else>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/login"
                aria-label="Go to login page"
              >
                Login
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                class="nav-link"
                to="/register"
                aria-label="Go to registration page"
              >
                Register
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Even if logout fails on backend, clear local state
    router.push('/login')
  }
}
</script>

<style scoped>
.navbar-brand {
  font-weight: 600;
}

.nav-link:focus,
.btn:focus {
  outline: 2px solid white;
  outline-offset: 2px;
}
</style>
