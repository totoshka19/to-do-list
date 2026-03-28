import { defineStore } from 'pinia'

export interface Task {
  id: number
  title: string
  description: string | null
  dueDate: string | null
  isCompleted: boolean
  priority: 'NORMAL' | 'IMPORTANT'
  createdAt: string
  updatedAt: string
  userId: number
  user: { id: number; name: string; email: string }
}

export const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const total = ref(0)
  const totalPages = ref(1)
  const loading = ref(false)

  const filters = reactive({
    search: '',
    status: 'all' as 'all' | 'active' | 'completed',
    sortBy: 'date' as 'date' | 'title' | 'priority',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 10,
  })

  async function fetchTasks() {
    const { $api } = useNuxtApp()
    loading.value = true
    try {
      const params: Record<string, unknown> = {
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        page: filters.page,
        limit: filters.limit,
      }
      if (filters.search) params.search = filters.search
      const res = await ($api as any).get('/api/tasks', { params })
      tasks.value = res.data.tasks
      total.value = res.data.total
      totalPages.value = res.data.totalPages
    } finally {
      loading.value = false
    }
  }

  async function createTask(data: {
    title: string
    description?: string
    dueDate?: string | null
    priority?: 'NORMAL' | 'IMPORTANT'
  }) {
    const { $api } = useNuxtApp()
    const res = await ($api as any).post('/api/tasks', data)
    await fetchTasks()
    return res.data
  }

  async function updateTask(id: number, data: Partial<{
    title: string
    description: string | null
    dueDate: string | null
    isCompleted: boolean
    priority: 'NORMAL' | 'IMPORTANT'
  }>) {
    const { $api } = useNuxtApp()
    const res = await ($api as any).put(`/api/tasks/${id}`, data)
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = res.data
    return res.data
  }

  async function deleteTask(id: number) {
    const { $api } = useNuxtApp()
    await ($api as any).delete(`/api/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t.id !== id)
    total.value--
  }

  return { tasks, total, totalPages, loading, filters, fetchTasks, createTask, updateTask, deleteTask }
})
