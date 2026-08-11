# Hookah Mix

Цифровой помощник кальянщика: коллекция табаков, каталог и подбор миксов по вкусовому профилю.

## Стек

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite (локально) / PostgreSQL (через Docker)
- Zod, Lucide Icons

## Быстрый старт

```bash
npm install
npm run db:reset
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

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
