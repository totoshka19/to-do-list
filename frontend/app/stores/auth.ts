import { defineStore } from 'pinia'
import { useLocalStorage } from '@vueuse/core'

interface User {
  id: number
  email: string
  name: string
  role: 'ADMIN' | 'USER'
}

export const useAuthStore = defineStore('auth', () => {
  const token = useLocalStorage<string | null>('auth_token', null)
  const user = useLocalStorage<User | null>('auth_user', null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const { $api } = useNuxtApp()
    const response = await ($api as any).post('/api/auth/login', { email, password })
    token.value = response.data.token
    user.value = response.data.user
    return response.data
  }

  function logout() {
    token.value = null
    user.value = null
  }

  return { token, user, isAuthenticated, login, logout }
})
