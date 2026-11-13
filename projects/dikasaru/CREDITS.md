# dikasaru

Откройте `dist/index.html` в Chrome, Edge или другом современном браузере. Для локального HTTP: `node preview.mjs`, затем http://127.0.0.1:4173. Список и оценки хранятся отдельно для каждого браузера, профиля и адреса.

- `node build.mjs` обновляет браузерный скрипт.
- `node --test` проверяет поиск, состояние списка и колонки.
- `node tools/build-catalog.mjs` пересобирает поставляемый индекс, если в папке `tools` есть `shiki-input.jsonl` и `manami-input.json`.

Каталог содержит только названия и их варианты, идентификаторы, год и порядок выдачи. Индекс не обновляется сам. Использованы [снимок тайтлов Shikimori](https://huggingface.co/datasets/a13team/shikimori-dataset) и [manami-project/anime-offline-database 2026-27](https://github.com/manami-project/anime-offline-database/releases/tag/2026-27). Данные manami доступны по ODbL 1.0 и DbCL 1.0, см. [лицензию проекта](https://github.com/manami-project/anime-offline-database/blob/2026-27/LICENSE). Индекс для использования и повторной сборки: `dist/catalog.js`.

Шрифт: Pixelify Sans, SIL OFL 1.1; лицензия в dist/pixelify-OFL.txt.

