# portfolio

Рабочий сайт dikasaru. Откройте `index.html` в браузере или выполните `node serve.mjs` и перейдите на http://127.0.0.1:4173.

## Редактирование

- `index.html` — шапка, папки, описания и окно просмотра.
- `components/site.jsx` — TechText, ShapeGrid и BorderGlow.
- `components/` — исходники трёх используемых эффектов и их стили.
- `assets/site.css`, `palettes.css`, `refinements.css`, `polish.css` — оформление и пять тем.
- `assets/project-viewer.js` — раскрытие папок и просмотр проектов.
- `assets/refinements.js` — выбор темы, сохранение настроек и звуки.
- `projects/` — локальные копии проектов портфолио, включая «Пудели», Tattoo YO, Cardi и «Аниме-лист». Стили и скрипты находятся рядом со страницами проектов или в `assets/`.

Контакт: https://t.me/dikasaru. Чтобы добавить работу, скопируйте блок `details.project-folder` в `index.html`. Сетка переносит папки автоматически. Папка 08 оставлена под будущий проект.

## Сборка

Зависимости устанавливаются командой `pnpm install`. Для пересборки выполните `node build.mjs` или `pnpm build`.

Сборка обновляет `assets/site-effects.js`, `assets/site-effects.css`, `assets/styles.css` и `assets/site-runtime.js`. Эти файлы нужны для просмотра сайта без установки зависимостей. `node_modules` сохранён для дальнейшей локальной разработки.

`assets/theme-entry.css` определяет порядок исходных стилей; `assets/runtime-entry.js` объединяет скрипты сайта. Шрифт Unbounded, иллюстрации проектов и все ресурсы хранятся локально.
