<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">To-Do List</h1>
        <p class="text-gray-500 mt-2">Управляйте задачами эффективно</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <form novalidate @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
              :class="errors.email
                ? 'border-red-400 bg-red-50 focus:ring-red-400'
                : 'border-gray-300 focus:ring-blue-500'"
              autocomplete="email"
            />
            <Transition name="error">
              <p v-if="errors.email" class="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ errors.email }}
              </p>
            </Transition>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="••••••••"
                class="w-full px-4 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                :class="errors.password
                  ? 'border-red-400 bg-red-50 focus:ring-red-400'
                  : 'border-gray-300 focus:ring-blue-500'"
                autocomplete="current-password"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <Transition name="error">
              <p v-if="errors.password" class="flex items-center gap-1 text-red-500 text-xs mt-1.5">
                <i class="bi bi-exclamation-circle-fill"></i>
                {{ errors.password }}
              </p>
            </Transition>
          </div>

          <div class="flex items-center justify-between mb-6">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input v-model="form.remember" type="checkbox" class="rounded border-gray-300 text-blue-600" />
              Запомнить меня
            </label>
            <button type="button" class="text-sm text-blue-600 hover:underline">Забыли пароль?</button>
          </div>

          <Transition name="error">
            <div v-if="serverError" class="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              <i class="bi bi-x-circle-fill shrink-0"></i>
              {{ serverError }}
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <span v-if="loading" class="flex items-center justify-center gap-2">
              <i class="bi bi-arrow-repeat animate-spin"></i> Входим...
            </span>
            <span v-else>Войти</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = reactive({ email: '', password: '' })
const serverError = ref('')
const loading = ref(false)
const showPassword = ref(false)

function validate() {
  errors.email = ''
  errors.password = ''
  let valid = true

  if (!form.email) {
    errors.email = 'Введите email'
    valid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Некорректный email'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Введите пароль'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  serverError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    await router.push('/')
  } catch (err: any) {
    serverError.value = err.response?.data?.message ?? 'Ошибка входа, попробуйте снова'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
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
