<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="modal fade show d-block"
      tabindex="-1"
      role="dialog"
      aria-labelledby="confirmModalLabel"
      aria-modal="true"
      @click.self="cancel"
    >
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header" :class="headerClass">
            <h5 id="confirmModalLabel" class="modal-title">
              {{ title }}
            </h5>
            <button
              type="button"
              class="btn-close"
              :class="{ 'btn-close-white': variant === 'danger' }"
              aria-label="Close"
              @click="cancel"
            ></button>
          </div>
          <div class="modal-body">
            <p>{{ message }}</p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="cancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="btn"
              :class="confirmButtonClass"
              @click="confirm"
            >
              {{ confirmText }}
            </button>
          </div>
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
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Confirm Action'
  },
  message: {
    type: String,
    default: 'Are you sure you want to proceed?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'primary', // primary, danger, warning, success
    validator: (value) => ['primary', 'danger', 'warning', 'success'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const headerClass = computed(() => {
  const classes = {
    danger: 'bg-danger text-white',
    warning: 'bg-warning',
    success: 'bg-success text-white',
    primary: 'bg-primary text-white'
  }
  return classes[props.variant] || classes.primary
})

const confirmButtonClass = computed(() => {
  return `btn-${props.variant}`
})

const confirm = () => {
  emit('confirm')
  emit('update:modelValue', false)
}

const cancel = () => {
  emit('cancel')
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

