<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto max-w-sm',
            toast.type === 'success'
              ? 'bg-white border border-green-200 text-green-800'
              : 'bg-white border border-red-200 text-red-800',
          ]"
        >
          <i :class="[
            'text-base shrink-0',
            toast.type === 'success' ? 'bi bi-check-circle-fill text-green-500' : 'bi bi-x-circle-fill text-red-500',
          ]"></i>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            @click="remove(toast.id)"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
