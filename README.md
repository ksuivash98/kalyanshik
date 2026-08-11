# Hookah Mix

Цифровой помощник кальянщика: коллекция табаков, каталог и подбор миксов.

**Онлайн:** [https://ksuivash98.github.io/kalyanshik/](https://ksuivash98.github.io/kalyanshik/)

## Как это работает на GitHub Pages

Приложение собрано как **статический сайт**:
- каталог зашит в фронтенд
- коллекция и миксы хранятся в `localStorage` браузера
- recommendation engine работает прямо в браузере

Серверная БД (Prisma) для Pages не нужна.

## Локальный запуск

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## Сборка под GitHub Pages

```bash
NEXT_PUBLIC_BASE_PATH=/kalyanshik npm run build:pages
```

Статика появится в папке `out/`.

## Автодеплой

При пуше в `main` / `master` GitHub Action собирает сайт и публикует на Pages.

В настройках репозитория:

1. **Settings → Pages**
2. Source: **GitHub Actions**

## Разделы

- `/` — главная
- `/collection` — моя коллекция
- `/catalog` — каталог
- `/create-mix` — подбор микса
- `/mixes` — сохранённые миксы
