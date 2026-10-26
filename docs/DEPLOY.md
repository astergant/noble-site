# Деплой

Черновик (этап 1). Полная инструкция с проверочным списком — этап 7.

## Схема

| Часть | Где | Как |
|---|---|---|
| `web` | **Cloudflare Pages** | Статика из prerender (`web/dist/web/browser`). Все страницы на трёх языках — готовый HTML |
| Заявки | **Pages Function** `web/functions/api/lead.ts` → Google Таблица | VPS **не нужен**. Секреты — в Settings → Environment variables проекта Pages |
| `api` | **VPS** (опционально) | Только если позже понадобится Telegram/SMTP дубль или свой сервер |
| Домен | Регистратор → DNS в Cloudflare | `nobledetailing.ge` → Pages |

**Домен, Cloudflare и Google-таблица регистрируются на владельца бизнеса.** Разработчик получает доступ как участник, а не владелец.

## web → Cloudflare Pages

1. Перед продакшен-сборкой заменить все DEMO/TODO-данные: `npm --prefix web run check:demo` должен пройти.
2. Pages → Create project → подключить репозиторий.
   - Root directory: `web`
   - Build command: `npm ci && npm run build:prod`
   - Output directory: `dist/web/browser`
   - Переменная окружения `NODE_VERSION=24.19.0`
3. Редирект `/` по языку: Pages Function `web/functions/index.ts` читает `Accept-Language` и отвечает 302 на `/ka/`, `/ru/` или `/en/` (по умолчанию грузинский). Без функции срабатывает мета-редирект на `/ka` из prerender.
4. `public/_redirects`: `/{lang}/book` → `/{lang}/contacts`; `/{lang}/works/*` → `/{lang}/works/`.
5. Форма на главной и popup пишут в `POST /api/lead` (Pages Function). Секреты Google — в Pages → Settings → Environment variables (Production **и** Preview):
   - простой путь: `GOOGLE_SHEETS_WEBHOOK` + `GOOGLE_SHEETS_TOKEN` (скрипт `tools/google-sheets-webhook.gs` в таблице);
   - или service account: `GOOGLE_SHEET_ID`, `GOOGLE_SHEET_TAB=Заявки`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`.
   Таблица: `1uPXgis_qGkNgSZ0yWt5On_thZRUkHAXg0CUK7VbpyrY`, лист **Заявки**. Колонки: A дата/время (Тбилиси), B имя, C телефон, D–G пусто, H услуга, I–J пусто, K «Новая». Остальные поля таблицы не трогаем.
6. `npm run build:prod` после `ng build` запускает `tools/postbuild.mjs`: `sitemap.xml` (все языки, `hreflang`), `robots.txt` и `404.html` (копия `ka/404`).
7. После первого деплоя: добавить `https://nobledetailing.ge/sitemap.xml` в Google Search Console и Яндекс Вебмастер; проверить скорость в PageSpeed Insights (локальные замеры — см. README).

Альтернатива: Node SSR на VPS (`node web/dist/web/server/server.mjs`, порт 4000). В этом режиме редирект по `Accept-Language` делает `web/src/server.ts`.

## Заявки без VPS (рекомендуется)

Google Таблица бесплатна. Cloudflare Pages Function на Free тоже бесплатна (заявки студии далеко от лимита).

1. Открыть таблицу → Расширения → Apps Script. Вставить `tools/google-sheets-webhook.gs`.
2. Настройки проекта → Свойства скрипта → `TOKEN` = длинная случайная строка.
3. Развертывание → Новое → Тип: **Веб-приложение**. Выполнять от имени: **меня**. Кто имеет доступ: **все**.
4. URL веб-приложения и тот же TOKEN — в секреты Pages (`GOOGLE_SHEETS_WEBHOOK`, `GOOGLE_SHEETS_TOKEN`).
5. Проверить тестовой заявкой с главной. В таблице должна появиться строка.

Локально: `npm run start` (web :4200 проксирует `/api` на api :3000). В `api/.env` те же переменные.

## api → VPS (не обязателен для форм)

```bash
cd api
cp .env.example .env      # заполнить TELEGRAM_*, SMTP_*, CORS_ORIGINS
docker compose up -d --build
curl http://127.0.0.1:3000/api/health
```

- Обратный прокси с HTTPS (Caddy или Nginx + Let's Encrypt) на `127.0.0.1:3000`.
- `TRUST_PROXY=1`, если перед API один прокси (нужно для лимита запросов по IP).
- `CORS_ORIGINS` — только домен сайта.
- Обновление: `git pull && docker compose up -d --build`.

## Секреты

Ключ Google и TOKEN только в `api/.env` и в секретах Cloudflare Pages. В репозитории — `api/.env.example` без значений. Клиентский код секретов не содержит.
