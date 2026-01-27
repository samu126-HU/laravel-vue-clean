<template>
  <teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] pointer-events-none">
      <transition-group name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto theme-surface rounded-lg shadow-2xl border overflow-hidden min-w-[320px] max-w-md"
          :class="{
            'border-green-500': toast.type === 'success',
            'border-red-500': toast.type === 'error',
            'border-blue-500': toast.type === 'info',
            'border-yellow-500': toast.type === 'warning'
          }"
        >
          <div class="flex items-center gap-3 p-4">
            <!-- Icon -->
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              :class="{
                'bg-green-500 bg-opacity-20': toast.type === 'success',
                'bg-red-500 bg-opacity-20': toast.type === 'error',
                'bg-blue-500 bg-opacity-20': toast.type === 'info',
                'bg-yellow-500 bg-opacity-20': toast.type === 'warning'
              }"
            >
              <!-- Success Icon -->
              <svg
                v-if="toast.type === 'success'"
                class="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              
              <!-- Error Icon -->
              <svg
                v-else-if="toast.type === 'error'"
                class="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              
              <!-- Info Icon -->
              <svg
                v-else-if="toast.type === 'info'"
                class="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              
              <!-- Warning Icon -->
              <svg
                v-else-if="toast.type === 'warning'"
                class="w-5 h-5 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <!-- Message -->
            <div class="flex-1 min-w-0">
              <p class="text-sm theme-text">{{ toast.message }}</p>
            </div>

            <!-- Close Button -->
            <button
              @click="removeToast(toast.id)"
              class="flex-shrink-0 p-1 rounded hover:bg-gray-500 hover:bg-opacity-20 transition-colors"
            >
              <svg
                class="w-4 h-4 theme-text opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast';

const { toasts, removeToast } = useToast();
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.2s ease-in;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
