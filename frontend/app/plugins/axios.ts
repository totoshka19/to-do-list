import axios from 'axios'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()
  const router = useRouter()

  const api = axios.create({
    baseURL: config.public.apiBase,
  })

  api.interceptors.request.use((request) => {
    if (authStore.token) {
      request.headers.Authorization = `Bearer ${authStore.token}`
    }
    return request
  })

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        authStore.logout()
        router.push('/login')
      }
      return Promise.reject(error)
    }
  )

  return {
    provide: { api },
  }
})
