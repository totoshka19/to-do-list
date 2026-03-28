<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">Мои задачи</h1>
          <p class="text-xs text-gray-400 mt-0.5">{{ authStore.user?.name }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="openCreateModal"
            class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <i class="bi bi-plus-lg"></i>
            <span class="hidden sm:inline">Добавить задачу</span>
          </button>
          <button
            @click="handleLogout"
            class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Выйти"
          >
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-4 py-6 space-y-4">
      <!-- Tabs -->
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="setStatus(tab.value)"
          :class="[
            'px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
            store.filters.status === tab.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Search + Sort -->
      <div class="flex gap-2">
        <div class="relative flex-1">
          <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none"></i>
          <input
            v-model="searchInput"
            type="text"
            placeholder="Поиск задач..."
            class="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            v-if="searchInput"
            @click="clearSearch"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i class="bi bi-x-lg text-sm"></i>
          </button>
        </div>
        <select
          v-model="sortValue"
          class="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
        >
          <option value="date:desc">По дате (убыв.)</option>
          <option value="date:asc">По дате (возр.)</option>
          <option value="title:asc">По названию</option>
          <option value="priority:desc">По приоритету</option>
        </select>
      </div>

      <!-- Results count -->
      <p v-if="!store.loading && store.total > 0" class="text-sm text-gray-400">
        {{ store.total }} {{ pluralTasks(store.total) }}
      </p>

      <!-- Desktop table -->
      <TaskTable
        :tasks="store.tasks"
        :loading="store.loading"
        @toggle="handleToggle"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <!-- Mobile list -->
      <TaskList
        :tasks="store.tasks"
        :loading="store.loading"
        @toggle="handleToggle"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <!-- Empty state -->
      <div
        v-if="!store.loading && store.tasks.length === 0"
        class="text-center py-16"
      >
        <i class="bi bi-inbox text-5xl text-gray-300 block mb-3"></i>
        <p class="text-gray-500 font-medium">
          {{ store.filters.search ? 'Ничего не найдено' : 'Задач пока нет' }}
        </p>
        <p class="text-gray-400 text-sm mt-1">
          {{ store.filters.search ? 'Попробуйте изменить запрос' : 'Нажмите «Добавить задачу», чтобы начать' }}
        </p>
      </div>

      <!-- Pagination -->
      <AppPagination
        :page="store.filters.page"
        :total-pages="store.totalPages"
        @update:page="setPage"
      />
    </main>

    <!-- Модалка добавления/редактирования -->
    <TaskModal
      :open="modalOpen"
      :task="editingTask"
      @close="modalOpen = false"
      @saved="handleSaved"
    />

    <!-- Подтверждение удаления -->
    <ConfirmModal
      :open="confirmOpen"
      :loading="deleteLoading"
      @confirm="confirmDelete"
      @cancel="confirmOpen = false"
    />

    <!-- Toast-уведомления -->
    <AppToast />
  </div>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import type { Task } from '~/stores/tasks'

const store = useTasksStore()
const authStore = useAuthStore()
const router = useRouter()
const { add: addToast } = useToast()

const searchInput = ref('')
const sortValue = ref('date:desc')

const modalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const confirmOpen = ref(false)
const deletingTask = ref<Task | null>(null)
const deleteLoading = ref(false)

const tabs = [
  { label: 'Все задачи', value: 'all' as const },
  { label: 'Активные', value: 'active' as const },
  { label: 'Выполненные', value: 'completed' as const },
]

const applySearch = useDebounceFn(() => {
  store.filters.search = searchInput.value
  store.filters.page = 1
  store.fetchTasks()
}, 400)

watch(searchInput, applySearch)

watch(sortValue, (val) => {
  const [sortBy, sortOrder] = val.split(':') as ['date' | 'title' | 'priority', 'asc' | 'desc']
  store.filters.sortBy = sortBy
  store.filters.sortOrder = sortOrder
  store.filters.page = 1
  store.fetchTasks()
})

function setStatus(status: 'all' | 'active' | 'completed') {
  store.filters.status = status
  store.filters.page = 1
  store.fetchTasks()
}

function setPage(page: number) {
  store.filters.page = page
  store.fetchTasks()
}

function clearSearch() {
  searchInput.value = ''
  store.filters.search = ''
  store.filters.page = 1
  store.fetchTasks()
}

async function handleToggle(task: Task) {
  await store.updateTask(task.id, { isCompleted: !task.isCompleted })
}

function openCreateModal() {
  editingTask.value = null
  modalOpen.value = true
}

function handleEdit(task: Task) {
  editingTask.value = task
  modalOpen.value = true
}

function handleDelete(task: Task) {
  deletingTask.value = task
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deletingTask.value) return
  deleteLoading.value = true
  try {
    await store.deleteTask(deletingTask.value.id)
    addToast('Задача удалена')
    confirmOpen.value = false
    deletingTask.value = null
  } catch {
    addToast('Не удалось удалить задачу', 'error')
  } finally {
    deleteLoading.value = false
  }
}

function handleSaved() {
  addToast(editingTask.value ? 'Задача обновлена' : 'Задача добавлена')
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

function pluralTasks(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'задача'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'задачи'
  return 'задач'
}

onMounted(() => {
  store.fetchTasks()
})
</script>
