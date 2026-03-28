<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="fixed inset-0 z-40 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/40" @click="$emit('close')"></div>

        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <div class="flex items-center justify-between mb-5">
            <h2 class="text-lg font-semibold text-gray-900">
              {{ task ? 'Редактировать задачу' : 'Новая задача' }}
            </h2>
            <button
              @click="$emit('close')"
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" novalidate class="space-y-4">
            <!-- Название -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Название <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                placeholder="Введите название задачи"
                :class="[
                  'w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors',
                  errors.title ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500',
                ]"
              />
              <Transition name="error">
                <p v-if="errors.title" class="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <i class="bi bi-exclamation-circle-fill"></i>{{ errors.title }}
                </p>
              </Transition>
            </div>

            <!-- Описание -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Описание</label>
              <textarea
                v-model="form.description"
                rows="3"
                placeholder="Опишите задачу (необязательно)"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
              ></textarea>
            </div>

            <!-- Дата -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Дата</label>
              <input
                v-model="form.dueDate"
                type="date"
                :class="[
                  'w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors',
                  errors.dueDate ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-300 focus:ring-blue-500',
                ]"
              />
              <Transition name="error">
                <p v-if="errors.dueDate" class="flex items-center gap-1 text-red-500 text-xs mt-1">
                  <i class="bi bi-exclamation-circle-fill"></i>{{ errors.dueDate }}
                </p>
              </Transition>
            </div>

            <!-- Приоритет -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Приоритет</label>
              <select
                v-model="form.priority"
                class="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NORMAL">Обычный</option>
                <option value="IMPORTANT">Важно</option>
              </select>
            </div>

            <!-- Кнопки -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="$emit('close')"
                class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                :disabled="loading"
                class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors"
              >
                <span v-if="loading" class="flex items-center justify-center gap-2">
                  <i class="bi bi-arrow-repeat animate-spin"></i> Сохранение...
                </span>
                <span v-else>{{ task ? 'Сохранить' : 'Добавить' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Task } from '~/stores/tasks'

const props = defineProps<{
  open: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const store = useTasksStore()
const loading = ref(false)

const form = reactive({
  title: '',
  description: '',
  dueDate: '',
  priority: 'NORMAL' as 'NORMAL' | 'IMPORTANT',
})

const errors = reactive({ title: '', dueDate: '' })

watch(() => props.open, (isOpen) => {
  if (!isOpen) return
  errors.title = ''
  errors.dueDate = ''
  if (props.task) {
    form.title = props.task.title
    form.description = props.task.description ?? ''
    form.dueDate = props.task.dueDate ? props.task.dueDate.split('T')[0] : ''
    form.priority = props.task.priority
  } else {
    form.title = ''
    form.description = ''
    form.dueDate = ''
    form.priority = 'NORMAL'
  }
})

function validate(): boolean {
  errors.title = ''
  errors.dueDate = ''
  let valid = true
  if (!form.title.trim()) {
    errors.title = 'Введите название задачи'
    valid = false
  }
  if (form.dueDate && isNaN(new Date(form.dueDate).getTime())) {
    errors.dueDate = 'Некорректная дата'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true
  try {
    const data = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueDate: form.dueDate ? `${form.dueDate}T00:00:00Z` : null,
      priority: form.priority,
    }
    if (props.task) {
      await store.updateTask(props.task.id, data)
    } else {
      await store.createTask(data)
    }
    emit('saved')
    emit('close')
  } finally {
    loading.value = false
  }
}
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
.error-enter-active,
.error-leave-active {
  transition: all 0.2s ease;
}
.error-enter-from,
.error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
