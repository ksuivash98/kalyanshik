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

### Важно (иначе будет 404 File not found на `/catalog/`)

Сейчас на сайте часто публикуется **README через Jekyll** с ветки `main`, а не приложение.

Сделай **один** из вариантов:

#### Вариант A (проще — ветка gh-pages)

1. **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: **`gh-pages`** / folder **`/ (root)`** → Save
4. Дождись зеленого workflow **Deploy Hookah Mix to GitHub Pages** после пуша

#### Вариант B (GitHub Actions)

1. **Settings → Pages**
2. Source: **GitHub Actions**
3. Actions → **Deploy Hookah Mix to GitHub Pages** → Re-run

Проверка:

- https://ksuivash98.github.io/kalyanshik/ — приложение (не текст README)
- https://ksuivash98.github.io/kalyanshik/catalog/ — каталог

## Разделы

- `/` — главная
- `/collection/` — моя коллекция
- `/catalog/` — каталог
- `/create-mix/` — подбор микса
- `/mixes/` — сохранённые миксы
