# Hookah Mix

Цифровой помощник кальянщика: коллекция табаков, каталог и подбор миксов по вкусовому профилю.

## Стек

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (локально) / PostgreSQL (через Docker)
- Zod, Lucide Icons

## Быстрый старт (веб-приложение)

```bash
npm install
npm run db:reset
npm run dev
```

Откройте в браузере: [http://localhost:3000](http://localhost:3000)

Это полноценное веб-приложение (PWA):
- работает в Chrome / Edge / Safari / Firefox
- адаптивно под телефон и планшет
- можно установить на домашний экран («Установить приложение» в браузере)

### Production

```bash
npm run build
npm run start
```

Или через Docker:

```bash
docker compose up --build -d
```

## PostgreSQL (опционально)

1. Запустите `docker compose up -d`
2. В `.env` укажите:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hookah_mix?schema=public"
```

3. В `prisma/schema.prisma` смените `provider` на `postgresql`
4. Выполните `npm run db:reset`

## Основные разделы

- `/` — dashboard
- `/collection` — моя коллекция
- `/catalog` — общий каталог
- `/create-mix` — wizard подбора микса
- `/mixes` — сохранённые миксы

На первом этапе используется demo-пользователь без сложной авторизации.
