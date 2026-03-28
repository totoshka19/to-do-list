# To-Do List

Тестовое задание. Приложение для управления задачами с авторизацией, ролями и REST API.

## Стек

| Часть | Технология |
|---|---|
| Фронтенд | Nuxt 3 + Vue 3 + TypeScript + Pinia |
| Стили | Tailwind CSS + Bootstrap Icons |
| HTTP-клиент | Axios |
| Бэкенд | Node.js + Express + TypeScript |
| Авторизация | JWT |
| БД | PostgreSQL (Neon) + Prisma ORM |
| Деплой | Vercel |

## Функциональность

- Авторизация по email/паролю, токен в localStorage
- Список задач с сортировкой, поиском (debounce) и фильтрацией по статусу
- Пагинация (10 задач на странице)
- Добавление, редактирование и удаление задач через модальные окна
- Бейджи приоритета: **Сегодня** (оранжевый), **Важно** (синий)
- Роли: `admin` видит и может редактировать/удалять все задачи, `user` — только свои
- Toast-уведомления, skeleton-загрузка, empty state
- Адаптивный интерфейс (desktop таблица / mobile список)

## Запуск локально

### Требования
- Node.js 18+
- Доступ к базе данных PostgreSQL (или аккаунт Neon)

### Установка

```bash
git clone <repo-url>
cd to-do-list
npm install
```

### Настройка бэкенда

```bash
cp backend/.env.example backend/.env
```

Заполни `backend/.env`:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3001
```

Применить миграции и seed:

```bash
cd backend
npx prisma migrate dev
npm run seed
```

### Запуск

```bash
# из корня проекта
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

### Тестовые аккаунты

| Email | Пароль | Роль |
|---|---|---|
| admin@todo.com | password123 | Администратор |
| ivan@todo.com | password123 | Пользователь |
| anastasia@todo.com | password123 | Пользователь |

## Деплой на Vercel

Проекты деплоятся раздельно.

### Бэкенд

1. Создай новый проект на Vercel, корневая директория — `backend`
2. Добавь переменные окружения:
   - `DATABASE_URL` — pooled connection string из Neon
   - `DIRECT_URL` — direct connection string из Neon
   - `JWT_SECRET` — секретный ключ
3. Deploy

### Фронтенд

1. Создай новый проект на Vercel, корневая директория — `frontend`
2. Добавь переменную окружения:
   - `NUXT_PUBLIC_API_BASE` — URL задеплоенного бэкенда (например `https://todo-api.vercel.app`)
3. Deploy
