<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/40" @click="$emit('cancel')"></div>

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
          <div class="flex items-center gap-4 mb-5">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <i class="bi bi-trash text-red-600 text-lg"></i>
            </div>
            <div>
              <h3 class="font-semibold text-gray-900">Удалить задачу?</h3>
              <p class="text-sm text-gray-500 mt-0.5">Это действие нельзя отменить</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button
              @click="$emit('cancel')"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              @click="$emit('confirm')"
              :disabled="loading"
              class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
            >
              <span v-if="loading" class="flex items-center justify-center gap-2">
                <i class="bi bi-arrow-repeat animate-spin"></i>
              </span>
              <span v-else>Удалить</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  open: boolean
  loading: boolean
}>()

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.97) translateY(8px);
}
</style>
