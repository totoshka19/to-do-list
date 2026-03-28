<template>
  <div class="md:hidden space-y-2">
    <template v-if="loading">
      <div v-for="i in 5" :key="i" class="animate-pulse bg-white rounded-xl border border-gray-200 p-4 space-y-2">
        <div class="flex justify-between">
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div class="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </template>
    <template v-else>
      <div
        v-for="task in tasks"
        :key="task.id"
        class="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 transition-colors"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-start gap-3 min-w-0">
            <input
              type="checkbox"
              :checked="task.isCompleted"
              @change="$emit('toggle', task)"
              class="mt-0.5 rounded border-gray-300 text-blue-600 cursor-pointer shrink-0"
            />
            <div class="min-w-0">
              <p :class="['text-sm font-medium truncate', task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900']">
                {{ task.title }}
              </p>
              <p v-if="task.dueDate" class="text-xs text-gray-400 mt-0.5">
                <i class="bi bi-calendar3 mr-1"></i>{{ formatDate(task.dueDate) }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span v-if="task.dueDate && isToday(task.dueDate)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Сегодня
            </span>
            <span v-else-if="task.priority === 'IMPORTANT'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              Важно
            </span>
            <button @click="$emit('edit', task)" class="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors">
              <i class="bi bi-pencil text-sm"></i>
            </button>
            <button @click="$emit('delete', task)" class="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors">
              <i class="bi bi-trash text-sm"></i>
            </button>
          </div>
        </div>
        <div v-if="task.description" class="mt-2 text-xs text-gray-500 line-clamp-2 pl-6">
          {{ task.description }}
        </div>
        <div class="mt-2 pl-6 flex items-center gap-2">
          <div class="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center">
            {{ initials(task.user.name) }}
          </div>
          <span class="text-xs text-gray-500">{{ task.user.name }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

defineProps<{
  tasks: Task[]
  loading: boolean
}>()

defineEmits<{
  toggle: [task: Task]
  edit: [task: Task]
  delete: [task: Task]
}>()

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr)
  const today = new Date()
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function initials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
</script>
