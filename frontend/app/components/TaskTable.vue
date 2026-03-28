<template>
  <div class="hidden md:block overflow-hidden rounded-xl border border-gray-200">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 border-b border-gray-200">
        <tr>
          <th class="w-10 px-4 py-3"></th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Название</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Дата</th>
          <th class="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Автор</th>
          <th class="w-20 px-4 py-3"></th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        <template v-if="loading">
          <tr v-for="i in 5" :key="i" class="animate-pulse">
            <td class="px-4 py-3.5"><div class="h-4 w-4 bg-gray-200 rounded"></div></td>
            <td class="px-4 py-3.5"><div class="h-4 bg-gray-200 rounded w-2/3"></div></td>
            <td class="px-4 py-3.5"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2">
                <div class="h-7 w-7 bg-gray-200 rounded-full"></div>
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </td>
            <td class="px-4 py-3.5"><div class="h-4 bg-gray-200 rounded w-12"></div></td>
          </tr>
        </template>
        <template v-else>
          <tr v-for="task in tasks" :key="task.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3.5">
              <input
                type="checkbox"
                :checked="task.isCompleted"
                @change="$emit('toggle', task)"
                class="rounded border-gray-300 text-blue-600 cursor-pointer focus:ring-blue-500"
              />
            </td>
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2 flex-wrap">
                <span :class="task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900 font-medium'">
                  {{ task.title }}
                </span>
                <span v-if="task.dueDate && isToday(task.dueDate)" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                  Сегодня
                </span>
                <span v-else-if="task.priority === 'IMPORTANT'" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Важно
                </span>
              </div>
            </td>
            <td class="px-4 py-3.5 text-gray-500 whitespace-nowrap">
              {{ task.dueDate ? formatDate(task.dueDate) : '—' }}
            </td>
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center shrink-0">
                  {{ initials(task.user.name) }}
                </div>
                <span class="text-gray-700">{{ task.user.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3.5">
              <div class="flex items-center gap-0.5">
                <button
                  @click="$emit('edit', task)"
                  class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Редактировать"
                >
                  <i class="bi bi-pencil"></i>
                </button>
                <button
                  @click="$emit('delete', task)"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Удалить"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
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
