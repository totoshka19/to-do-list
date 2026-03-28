<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1 mt-4">
    <button
      :disabled="page === 1"
      @click="$emit('update:page', page - 1)"
      class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
    >
      <i class="bi bi-chevron-left"></i>
    </button>

    <template v-for="p in pages" :key="p">
      <span v-if="p === '...'" class="px-2 py-1.5 text-gray-400 select-none">...</span>
      <button
        v-else
        @click="$emit('update:page', p as number)"
        :class="[
          'min-w-[2rem] px-3 py-1.5 text-sm rounded-lg transition-colors',
          p === page
            ? 'bg-blue-600 text-white font-medium'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
      >
        {{ p }}
      </button>
    </template>

    <button
      :disabled="page === totalPages"
      @click="$emit('update:page', page + 1)"
      class="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
    >
      <i class="bi bi-chevron-right"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number
  totalPages: number
}>()

defineEmits<{
  'update:page': [page: number]
}>()

const pages = computed(() => {
  const { page, totalPages } = props
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)

  if (page <= 4) return [1, 2, 3, 4, 5, '...', totalPages]
  if (page >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  return [1, '...', page - 1, page, page + 1, '...', totalPages]
})
</script>
