<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-labelledby="todoModalLabel"
      aria-modal="true"
      @click.self="close"
    >
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="todoModalLabel" class="modal-title">
              {{ isEdit ? 'Edit Todo' : 'Create New Todo' }}
            </h5>
            <button
              type="button"
              class="btn-close"
              aria-label="Close"
              @click="close"
            ></button>
          </div>
          <form @submit.prevent="handleSubmit">
            <div class="modal-body">
              <div class="mb-3">
                <label for="todoTitle" class="form-label">
                  Title <span class="text-danger">*</span>
                </label>
                <input
                  id="todoTitle"
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.title }"
                  placeholder="Enter todo title"
                  required
                  maxlength="255"
                  @input="clearError('title')"
                />
                <div v-if="errors.title" class="invalid-feedback">
                  {{ errors.title }}
                </div>
              </div>

              <div class="mb-3">
                <label for="todoDescription" class="form-label">
                  Description
                </label>
                <textarea
                  id="todoDescription"
                  v-model="form.description"
                  class="form-control"
                  :class="{ 'is-invalid': errors.description }"
                  rows="3"
                  placeholder="Enter todo description (optional)"
                  maxlength="1000"
                  @input="clearError('description')"
                ></textarea>
                <div v-if="errors.description" class="invalid-feedback">
                  {{ errors.description }}
                </div>
                <small class="text-muted">
                  {{ form.description?.length || 0 }}/1000 characters
                </small>
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="close"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ isEdit ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div
      v-if="modelValue"
      class="modal-backdrop fade show"
    ></div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useSanitize } from '@/composables/useSanitize'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  todo: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const { validators, errors, validate, clearError, clearErrors } = useFormValidation()
const { sanitizeInput } = useSanitize()

const form = ref({
  title: '',
  description: ''
})

const isEdit = ref(false)

watch(() => props.modelValue, (value) => {
  if (value) {
    if (props.todo) {
      isEdit.value = true
      form.value = {
        title: props.todo.title || '',
        description: props.todo.description || ''
      }
    } else {
      isEdit.value = false
      form.value = {
        title: '',
        description: ''
      }
    }
    clearErrors()
  }
})

const close = () => {
  emit('update:modelValue', false)
  form.value = { title: '', description: '' }
  clearErrors()
}

const handleSubmit = () => {
  // Validate
  const isValid = validate('title', form.value.title, [
    (val) => validators.required(val, 'Title'),
    (val) => validators.maxLength(val, 255, 'Title')
  ])

  if (form.value.description) {
    validate('description', form.value.description, [
      (val) => validators.maxLength(val, 1000, 'Description')
    ])
  }

  if (!isValid) return

  // Sanitize input
  const sanitizedData = {
    title: sanitizeInput(form.value.title),
    description: form.value.description ? sanitizeInput(form.value.description) : ''
  }

  emit('submit', sanitizedData)
}

// Handle Escape key
const handleKeyDown = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    close()
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeyDown)
}
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

