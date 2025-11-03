<template>
  <div class="container-fluid">
    <a href="#main-content" class="skip-to-main">Skip to main content</a>
    
    <div class="row">
      <!-- Sidebar -->
      <nav
        class="col-md-3 col-lg-2 d-md-block bg-light sidebar"
        aria-label="User information sidebar"
      >
        <div class="position-sticky pt-3">
          <h2 class="h6 sidebar-heading px-3 mt-4 mb-1 text-muted">
            User Info
          </h2>
          <ul class="nav flex-column mb-2">
            <li class="nav-item">
              <div class="px-3">
                <strong>{{ authStore.user?.username }}</strong><br />
                <small class="text-muted">{{ authStore.user?.email }}</small><br />
                <span class="badge bg-primary mt-1">{{ authStore.user?.role }}</span>
              </div>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Main content -->
      <main id="main-content" class="col-md-9 ms-sm-auto col-lg-10 px-md-4" role="main">
        <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
          <h1 class="h2">My Todos</h1>
          <div class="btn-toolbar mb-2 mb-md-0" role="toolbar" aria-label="Todo actions">
            <button
              type="button"
              class="btn btn-primary me-2"
              @click="openCreateModal"
              aria-label="Create new todo"
            >
              <span aria-hidden="true">+</span> New Todo
            </button>
            <div class="btn-group" role="group" aria-label="Filter todos">
              <button
                type="button"
                class="btn btn-sm"
                :class="filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
                :aria-pressed="filter === 'all'"
                @click="filter = 'all'"
              >
                All
              </button>
              <button
                type="button"
                class="btn btn-sm"
                :class="filter === 'active' ? 'btn-primary' : 'btn-outline-secondary'"
                :aria-pressed="filter === 'active'"
                @click="filter = 'active'"
              >
                Active
              </button>
              <button
                type="button"
                class="btn btn-sm"
                :class="filter === 'completed' ? 'btn-primary' : 'btn-outline-secondary'"
                :aria-pressed="filter === 'completed'"
                @click="filter = 'completed'"
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="row mb-4" role="region" aria-label="Todo statistics">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h2 class="h5 card-title">Total Todos</h2>
                <p class="h2" aria-live="polite">{{ todos.length }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h2 class="h5 card-title">Active</h2>
                <p class="h2" aria-live="polite">{{ activeTodos }}</p>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <h2 class="h5 card-title">Completed</h2>
                <p class="h2" aria-live="polite">{{ completedTodos }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Todos List -->
        <div v-if="loading" class="text-center py-5" role="status" aria-live="polite">
          <div class="spinner-border" aria-hidden="true">
            <span class="visually-hidden">Loading todos...</span>
          </div>
          <p class="mt-2">Loading todos...</p>
        </div>

        <div
          v-else-if="filteredTodos.length === 0"
          class="text-center py-5"
          role="status"
          aria-live="polite"
        >
          <p class="text-muted">No todos found. Create one to get started!</p>
        </div>

        <div v-else class="row" role="region" aria-label="Todos list">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="col-md-6 col-lg-4 mb-3"
          >
            <article
              class="card h-100"
              :class="{ 'border-success': todo.completed }"
              :aria-label="`Todo: ${todo.title}`"
            >
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h3 class="h5 card-title" :class="{ 'text-decoration-line-through text-muted': todo.completed }">
                    {{ todo.title }}
                  </h3>
                  <div class="form-check">
                    <input
                      :id="`todo-${todo.id}`"
                      class="form-check-input"
                      type="checkbox"
                      :checked="todo.completed"
                      :aria-label="`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`"
                      @change="toggleTodo(todo.id)"
                    />
                  </div>
                </div>
                <p class="card-text" :class="{ 'text-muted': todo.completed }">
                  {{ todo.description || 'No description' }}
                </p>
                <small class="text-muted">
                  <time :datetime="todo.createdAt">{{ formatDate(todo.createdAt) }}</time>
                </small>
                <div class="mt-3">
                  <button
                    class="btn btn-sm btn-outline-primary me-2"
                    :aria-label="`Edit ${todo.title}`"
                    @click="openEditModal(todo)"
                  >
                    Edit
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    :aria-label="`Delete ${todo.title}`"
                    @click="confirmDelete(todo)"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>

    <!-- Todo Modal -->
    <TodoModal
      v-model="showTodoModal"
      :todo="editingTodo"
      :loading="modalLoading"
      @submit="handleTodoSubmit"
    />

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      v-model="showDeleteModal"
      title="Delete Todo"
      :message="`Are you sure you want to delete '${todoToDelete?.title}'? This action cannot be undone.`"
      confirm-text="Delete"
      cancel-text="Cancel"
      variant="danger"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { todoAPI } from '@/services/api'
import TodoModal from '@/components/TodoModal.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const authStore = useAuthStore()

const todos = ref([])
const loading = ref(false)
const modalLoading = ref(false)
const filter = ref('all')
const showTodoModal = ref(false)
const showDeleteModal = ref(false)
const editingTodo = ref(null)
const todoToDelete = ref(null)

const filteredTodos = computed(() => {
  if (filter.value === 'active') {
    return todos.value.filter(todo => !todo.completed)
  } else if (filter.value === 'completed') {
    return todos.value.filter(todo => todo.completed)
  }
  return todos.value
})

const activeTodos = computed(() => todos.value.filter(todo => !todo.completed).length)
const completedTodos = computed(() => todos.value.filter(todo => todo.completed).length)

const fetchTodos = async () => {
  loading.value = true
  try {
    const response = await todoAPI.getAll()
    todos.value = response.data
  } catch (error) {
    console.error('Failed to fetch todos:', error)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  editingTodo.value = null
  showTodoModal.value = true
}

const openEditModal = (todo) => {
  editingTodo.value = todo
  showTodoModal.value = true
}

const handleTodoSubmit = async (todoData) => {
  modalLoading.value = true
  try {
    if (editingTodo.value) {
      await todoAPI.update(editingTodo.value.id, todoData)
    } else {
      await todoAPI.create(todoData)
    }
    showTodoModal.value = false
    await fetchTodos()
  } catch (error) {
    console.error('Failed to save todo:', error)
  } finally {
    modalLoading.value = false
  }
}

const confirmDelete = (todo) => {
  todoToDelete.value = todo
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!todoToDelete.value) return

  try {
    await todoAPI.delete(todoToDelete.value.id)
    await fetchTodos()
  } catch (error) {
    console.error('Failed to delete todo:', error)
  } finally {
    todoToDelete.value = null
  }
}

const toggleTodo = async (id) => {
  try {
    await todoAPI.toggle(id)
    await fetchTodos()
  } catch (error) {
    console.error('Failed to toggle todo:', error)
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

onMounted(() => {
  fetchTodos()
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 56px;
  bottom: 0;
  left: 0;
  z-index: 100;
  padding: 0;
  overflow-x: hidden;
  overflow-y: auto;
}

.sidebar-heading {
  font-size: .75rem;
  text-transform: uppercase;
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

@media (max-width: 767.98px) {
  .sidebar {
    position: relative;
    top: 0;
  }
}
</style>

