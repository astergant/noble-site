# Проверка переводов (needsReview)

Грузинский — основной язык сайта. Все грузинские и английские тексты написаны ИИ как черновик и **должны быть проверены носителем**. Русский — язык-источник.

Как проверять: откройте файл, исправьте строку прямо в JSON, отметьте пункт ниже. Структура ключей не меняется, меняются только значения.

## Файлы

| Файл | Что внутри | ka | en |
|---|---|---|---|
| `web/src/assets/i18n/ka.json` | Интерфейс, меню, футер, cookies, hero, заголовки страниц, SEO title/description | needsReview | — |
| `web/src/assets/i18n/en.json` | То же на английском | — | needsReview |
| `web/src/app/data/services.json` | Названия, описания, «что входит», сроки, примечания к ценам (поля `name`, `short`, `description`, `includes`, `duration`, `price.note`, `warranty`) | needsReview | needsReview |
| `web/src/app/data/site.json` | Адрес (`address.ka`) | needsReview | — |
| `web/src/app/data/journal.json` | Заголовки и анонсы статей | needsReview | needsReview |
| `web/src/app/data/articles/*.json` | Тексты 5 статей (блоки `p` / `h2` / `ul`) | needsReview | needsReview |
| `web/src/app/data/faq.json` | 12 вопросов и ответов | needsReview | needsReview |
| `web/src/app/data/legal.json` | Политика конфиденциальности, условия гарантии (также нужен юрист) | needsReview | needsReview |

## Ключи, требующие особого внимания

| Ключ / поле | Текущий вариант (ka) | Вопрос к носителю |
|---|---|---|
| Термин «оклейка плёнкой» | `PPF ფირის გადაკვრა` / `დაფარვა PPF ფირით` | Как говорят клиенты: «გადაკვრა» или «დაფარვა»? Нужен один термин везде (влияет на SEO) |
| `services.ppf-risk-zones.name` | რისკის ზონების დაცვა PPF ფირით | Естественно ли звучит «რისკის ზონები»? |
| `services.ppf-detailing.name` | დეტალიზაცია გადაკვრისას | Понятно ли клиенту? |
| `priceVariants.suv` | ჯიპი | «ჯიპი» или «внедорожник» по-другому? |
| `priceVariants.crossover` | კროსოვერი | |
| `services.soundproofing-*.name` | ხმის იზოლაცია | Или «ხმაურის იზოლაცია»? |
| `services.soundproofing-arches.name` | თაღების ხმის იზოლაცია | Колёсные арки — «თაღები» корректно? |
| `services.interior-cleaning.name` | სალონის ქიმწმენდა | |
| `site.address.ka` | ვასო გოძიაშვილის I შესახვევი 6, თბილისი | Как адрес пишут по-грузински (официально)? |
| `common.priceFrom` | `{{value}}-დან` (напр. `$1 300-დან`) | Корректна ли форма с валютой? |
| `status.closed` | დაკეტილია · გაიხსნება {{open}}-ზე | |
| `home.hero.*` | თქვენი ავტომობილის / დაცვა და მოვლა | Звучит ли премиально и естественно? |
| `home.hero.eyebrow` | Отображается заглавными (мтаврули) | Уместно ли мтаврули в подписях? |
| `cookies.text` | ანალიტიკის ქუქი-ფაილებს ვიყენებთ… | |
| `seo.*` (все) | | Совпадают ли формулировки с тем, что ищут в Google (см. `SEO_KEYWORDS.md`, этап 7) |

## Статус

- [ ] ka.json проверен носителем
- [ ] en.json проверен носителем английского
- [ ] services.json (ka) проверен
- [ ] services.json (en) проверен
- [ ] адрес на грузинском подтверждён
- [ ] статьи журнала (ka, en) проверены
- [ ] FAQ (ka, en) проверен
- [ ] legal.json (ka, en) проверен
