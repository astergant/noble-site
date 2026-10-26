# Noble Detailing — сайт

Многоязычный (ka / ru / en) сайт детейлинг-студии Noble Detailing, Тбилиси.

```
noble/
├─ web/     Angular 22 (SSR + prerender, zoneless), Transloco, Tailwind CSS 4
├─ api/     Node.js + Express + TypeScript: приём заявок, уведомления
├─ tools/   подготовка брендовых ассетов, проверка DEMO, скриншоты, smoke-тесты
└─ docs/    допущения, переводы, недостающий контент, гайд по текстам, деплой
```

> Статус: **этап 1 (каркас)**. Полный README (добавление услуги, смена цен, отзывы, языки, деплой) — этап 7.

## Запуск

Требуется Node.js ≥ 24.15.

```bash
npm run install:all          # зависимости корня, web и api
cp api/.env.example api/.env # ключи Telegram/SMTP можно оставить пустыми
npm run start                # web → http://localhost:4200, api → http://localhost:3000
```

Если порт 4200 занят: `npm --prefix web start -- --port 4300` и `npm --prefix api run dev` в отдельных терминалах.

## Сборка

| Команда | Что делает |
|---|---|
| `npm --prefix web run build` | Сборка + prerender всех страниц на трёх языках (`web/dist/web/browser`) |
| `npm --prefix web run build:prod` | То же, но **падает**, пока в данных есть `demo: true`, `todo` или `DEMO`; после сборки пишет `sitemap.xml`, `robots.txt`, `404.html` (`tools/postbuild.mjs`) |
| `npm --prefix web run check:demo` | Только отчёт о DEMO/TODO |
| `npm --prefix api run build` | Компиляция API в `api/dist` |

## Проверки

```bash
node tools/screenshots.mjs http://localhost:4200 docs/screenshots/latest   # 360/768/1280 × ka/ru/en
node tools/smoke.mjs http://localhost:4200                                 # меню, фокус, язык, 404, лайтбоксы, цены, карусель, FAQ, журнал
```

Lighthouse (не зависимость проекта, запускается через npx в Edge):

```bash
npx lighthouse@12 http://localhost:4000/ru/ --chrome-path="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --chrome-flags="--headless=new" --view
```

Локальный Node-сервер не сжимает ответы, поэтому Performance занижен; на Cloudflare Pages сжатие включено. Замер 2026-10 на статике с gzip: Accessibility, Best Practices, SEO — 100; Performance — desktop 98, mobile 76–87 (симуляция медленного 4G).

## Где что менять

| Что | Файл |
|---|---|
| Контакты, часы, рейтинг, гарантия, флаги (форма, Telegram) | `web/src/app/data/site.json` |
| Услуги и цены | `web/src/app/data/services.json` |
| Комплексы услуг | `web/src/app/data/bundles.json` |
| Работы (машины, фото, услуги; открываются в лайтбоксе) | `web/src/app/data/works.json` |
| Отзывы (текст как в Google, без правок) | `web/src/app/data/reviews.json`; рейтинги Google/Яндекс — `site.json` → `rating` |
| Журнал | список — `web/src/app/data/journal.json`, тексты — `data/articles/<slug>.json` + строка в `ARTICLE_BODIES` (`core/data/content.service.ts`) |
| Вопросы и ответы | `web/src/app/data/faq.json` (`serviceSlugs` — показывать на странице услуги) |
| Политика конфиденциальности, условия гарантии | `web/src/app/data/legal.json` |
| Фото: alt на 3 языках, точка фокуса | `web/src/assets/media/manifest.json`, затем `python tools/optimize-media.py D:/nobel/brend` (нужны `pip install pillow pillow-heif`) |
| Видео (подпись на 3 языках, к какой услуге) | `web/src/app/data/videos.json`, затем `python tools/optimize-video.py D:/nobel/brend` (нужен `pip install imageio-ffmpeg`) |
| Включить/выключить формы заявок | `site.json` → `features.leadForm` |
| Куда пишутся заявки | Google Таблица, лист «Заявки», через `POST /api/lead`; секреты в `api/.env` / Cloudflare Pages |
| Карта (виджет Яндекса, ссылки Google/Яндекс) | `site.json` → `maps` |
| Тексты интерфейса | `web/src/assets/i18n/{ka,ru,en}.json` |
| Цвета, шрифты, радиусы, тени | `web/src/styles.css` (`@theme`) |
| Логотипы, шрифты, ленты корон (из брендбука) | `python tools/brand-assets.py D:/nobel/brend` |

## Зависимости и зачем они

**web**
- `@angular/*`, `@angular/ssr`, `express` — фреймворк, prerender и SSR.
- `@jsverse/transloco` — переводы, переключение языка без перезагрузки.
- `tailwindcss`, `@tailwindcss/postcss`, `postcss` (dev) — стили и дизайн-токены.
- `@fontsource-variable/noto-sans-georgian` — грузинский шрифт (OFL), подключается локально, только грузинские глифы.

**api**
- `express` — HTTP-сервер; `helmet` — заголовки безопасности; `cors` — доступ только с домена сайта.
- `express-rate-limit` — лимит заявок по IP; `zod` — валидация заявки и `.env`.
- `nodemailer` — дублирование заявок на e-mail.
- `google-auth-library` — запись заявок в Google Таблицу от сервисного аккаунта (официальная библиотека Google).
- `tsx`, `typescript` (dev) — запуск и сборка TypeScript.

**корень**
- `concurrently` (dev) — `npm run start` поднимает web и api вместе.
- `playwright-core` (dev) — скриншоты и smoke-тесты в установленном Microsoft Edge, без скачивания браузеров.

**инструменты (Python, только для разработки)**
- `pillow`, `pillow-heif` — фото студии (HEIC) → WebP.
- `imageio-ffmpeg` — готовый ffmpeg без установки в систему. Переводит HDR-видео с iPhone в SDR, уменьшает до 720 px и кодирует в H.264 MP4 (~1,5 МБ на ролик) с постером WebP. Ролики не ретушируются.

Иконки: пути из Lucide (ISC) и simple-icons (CC0) скопированы в `web/src/app/shared/ui/icon/icons.ts`, runtime-зависимости нет.
