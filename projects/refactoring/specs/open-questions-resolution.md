---
title: "Разрешение открытых вопросов: Principal-Ready рефакторинг"
status: draft
created: 2026-04-07
updated: 2026-04-07
tags: [p-refactoring]
---

# Разрешение открытых вопросов

Этот спек закрывает пять открытых вопросов из `specs/principal-ready-obsidian-friendly.md`.
Каждый вопрос — отдельное микрорешение. Каждое рассматривается независимо.

---

## OQ1: qmd + Soft Archive

**Вопрос:** Поддерживает ли qmd фильтрацию по frontmatter (`status: archived`)? Если нет — физическое перемещение в `archive/` или только метаданные?

### Факты

- **[VERIFIED]** `qmd` фильтрует по коллекциям через `-c <name>`. Коллекции — директории, не frontmatter-поля.
- **[VERIFIED]** `archive/` уже определена как отдельная qmd-коллекция в `qmd.yml` (`path: archive/`).
- **[VERIFIED]** Нет нативной поддержки фильтрации по `status: archived` в frontmatter.
- **[VERIFIED]** Текущая команда `/archive` физически перемещает папки в `archive/`.

### Варианты

**Вариант A: Только метаданные** — убрать физическое перемещение, ставить `status: archived` в frontmatter. Agent игнорирует вручную.
- Pro: Obsidian-friendly, нет риска поломки ссылок при перемещении.
- Con: qmd продолжает индексировать архивные файлы как часть основных коллекций — нет изоляции в поиске.
- Con: Требует от агента ручного skipа на каждый запрос — хрупко.

**Вариант B: Физическое перемещение + метаданные (Рекомендуется)** — `/archive` выполняет оба действия: устанавливает `status: archived` в frontmatter И физически перемещает в `archive/`.
- Pro: qmd-изоляция работает через коллекцию `archive/` — без кастомной логики.
- Pro: `status: archived` в frontmatter даёт агенту явный сигнал без чтения пути.
- Pro: Git история сохраняется (git mv, не rm+create).
- Con: Нужно чинить ссылки при перемещении (уже делает `/archive` на шаге 4).

**Вариант C: Soft-archive только для resources** — физическое перемещение для projects/areas, метаданные для resources.
- Con: Два разных механизма для одного концепта — высокая когнитивная нагрузка.

### Решение

**Вариант B.** Физическое перемещение + `status: archived` в frontmatter — правильное решение. qmd изолирует архив коллекцией, агент получает явный флаг, Git сохраняет историю. Изменение в `/archive` минимальное: добавить шаг установки `status: archived` до перемещения.

---

## OQ2: Hybrid Search

**Вопрос:** Достаточно ли `rg` как BM25-слоя поверх qmd, или нужен отдельный инструмент? Нужно ли добавлять что-то для `/ask`?

### Факты

- **[VERIFIED]** `qmd query "<text>"` — уже hybrid search: `BM25 + vector + LLM reranking`. Это режим по умолчанию.
- **[VERIFIED]** `qmd search "<text>"` — чистый BM25 keyword search (без LLM).
- **[VERIFIED]** `qmd vsearch "<text>"` — чистый vector search.
- **[VERIFIED]** `qmd query` поддерживает structured query documents с явными `lex:` / `vec:` / `hyde:` строками.
- **[ASSUMED]** Текущая команда `/ask` использует qmd, но неизвестно, какой именно режим (`query` vs `search` vs `vsearch`).

### Варианты

**Вариант A: Ничего не менять** — `qmd query` уже hybrid, проблема надуманна.
- Pro: Zero effort.
- Con: Агент может не знать о разнице между режимами и не использовать `qmd search` для точных запросов.

**Вариант B: Только документировать в AGENTS.md (Рекомендуется)** — добавить в AGENTS.md явную таблицу: когда использовать `qmd query` vs `qmd search` vs `qmd vsearch`.
- Pro: Zero code changes. Сразу используем то, что уже есть.
- Pro: Агент получает чёткий routing guide.
- Con: Нет автоматического routing — агент должен сам выбрать режим.

**Вариант C: Обновить `/ask` с auto-routing** — определять тип запроса (семантический vs точный) и вызывать нужный режим.
- Pro: Прозрачно для пользователя.
- Con: Классификация намерения ненадёжна и добавляет сложность.

### Решение

**Вариант B.** qmd уже hybrid. Нужен только routing guide в AGENTS.md. Никаких новых инструментов, никакого нового кода. `/ask` проверить отдельно на предмет режима (вне этого спека).

---

## OQ3: `/check-env` — команда или preflight?

**Вопрос:** Должен ли check-env быть slash-командой (on-demand) или автоматическим preflight в `opencode.json`?

### Факты

- **[VERIFIED]** `opencode.json` не поддерживает lifecycle hooks, preflight-проверки или события запуска. Схема содержит: TUI, Server, Tools, Models, Agents, Permissions, MCP, Plugins, Instructions, Compaction, Watcher — никаких хуков.
- **[VERIFIED]** Единственный механизм "автозапуска" в OpenCode — `instructions:` (файлы загружаются как системный промпт).
- **[VERIFIED]** Slash-команды (`.opencode/commands/*.md`) — on-demand, вызываются явно.
- **[ASSUMED]** Добавление preflight-проверки в `AGENTS.md` через инструкцию "запускай `/check-env` в начале каждой сессии" будет исполняться непоследовательно.

### Варианты

**Вариант A: Только slash-команда `/check-env`** — вызывается вручную когда нужно проверить окружение.
- Pro: Простая реализация — один файл `.opencode/commands/check-env.md`.
- Pro: Не замедляет старт каждой сессии.
- Con: Никогда не запустится автоматически — проблемы окружения обнаружатся поздно.

**Вариант B: Slash-команда + инструкция в AGENTS.md (Рекомендуется)** — создать `/check-env` И добавить в AGENTS.md правило "при первом использовании нового инструмента или после обновления Node.js — запусти `/check-env`".
- Pro: Команда существует для on-demand вызова.
- Pro: AGENTS.md задаёт условие-триггер без замедления каждого старта.
- Con: Агент выполняет правило непоследовательно.

**Вариант C: `env-context.js` как preflight** — добавить в `env-context.js` автоматический запуск и подключить через `instructions:` в `opencode.json` через wrapper.
- Con: `opencode.json` не поддерживает исполнение скриптов при старте — механизма нет.

### Решение

**Вариант B.** `/check-env` как slash-команда + trigger-правило в AGENTS.md. Проверяет: `node --version`, `jira`, `gh`, `qmd`, `repomix` — и выводит статус каждого в таблице.

---

## OQ4: Замена `health-kg-coverage.js`

**Вопрос:** Достаточно ли `health-orphans.js` как замены после удаления `knowledge-graph.md`?

### Факты

- **[VERIFIED]** `health-kg-coverage.js` — проверяет, есть ли файл из `resources/` в таблице `knowledge-graph.md`. Зависит от `lib/graph.js`.
- **[VERIFIED]** `health-orphans.js` — проверяет, что у каждого файла из `resources/` есть хотя бы один inbound link из остального репозитория. Зависит от `lib/links.js`.
- **[VERIFIED]** `lib/graph.js` содержит только три функции: `readKnowledgeGraph`, `listResourceFiles`, `getGraphEntry`. Первая и третья зависят от `knowledge-graph.md`.
- **[VERIFIED]** `health-all.js` включает оба чека: `kg-coverage` и `orphans`.
- **[ASSUMED]** Цель kg-coverage — убедиться, что ни одна статья не "потерялась" без индекса. Orphans-чек делает то же самое через граф связей — более строго (требует реального inbound link, не просто строку в таблице).

### Варианты

**Вариант A: Удалить health-kg-coverage.js, оставить health-orphans.js (Рекомендуется)**
- Pro: Orphans — более строгая проверка: требует реальной связи, не просто запись в файле.
- Pro: Удаляет зависимость от `lib/graph.js`, который можно тоже удалить.
- Pro: `health-all.js` становится проще — один чек вместо двух перекрывающихся.
- Con: Теряем явную проверку "каждый ресурс есть в индексе" — но индекса больше нет.

**Вариант B: Переписать health-kg-coverage.js без knowledge-graph.md** — новый вариант проверяет что-то другое (например, что у каждого ресурса заполнен frontmatter `tags`).
- Con: Переименовывать и переосмыслять скрипт — бессмысленная сложность.

**Вариант C: Ничего не трогать** — оставить kg-coverage падать с graceful exit (он уже делает `process.exit(0)` если файл не найден).
- Con: Мертвый код в `health-all.js`. Вводит в заблуждение.

### Решение

**Вариант A.** Удалить `health-kg-coverage.js` и `lib/graph.js`. Убрать `kg-coverage` из `health-all.js`. `health-orphans.js` — достаточная замена, покрывающая ту же цель строже.

---

## OQ5: Confluence lib — общая или inline?

**Вопрос:** Создавать `lib/confluence.js` или держать логику инлайн в каждом скрипте?

### Факты

- **[VERIFIED]** Три скрипта зависят от `loadMapIds()` из `config.js`: `confluence-updates.js`, `confluence-missing.js`, `confluence-backfill-dates.js`.
- **[VERIFIED]** После удаления `confluence-map.md` все три должны сканировать `confluence: []` frontmatter из всех `.md` файлов репозитория.
- **[VERIFIED]** Уже есть `lib/links.js` (ссылки), `lib/frontmatter.js` (парсинг), `lib/graph.js` (граф). Паттерн `lib/` устоявшийся.
- **[ASSUMED]** Логика "собрать все page IDs из frontmatter" будет вызываться в 3+ местах — соответствует правилу "extract pattern when it repeats 3+ times".

### Варианты

**Вариант A: Инлайн в каждом скрипте** — каждый из трёх скриптов сам сканирует frontmatter.
- Con: Дублирование кода. При изменении формата `confluence:` нужно менять в трёх местах.

**Вариант B: Новый `lib/confluence.js` (Рекомендуется)** — экспортирует `loadConfluenceIds(repoRoot)` → `{ ids: string[], inMap: Set<string>, byFile: Map<string, string[]> }`.
- Pro: Единственное место изменения при смене формата frontmatter.
- Pro: Можно добавить `byFile` — маппинг `pageId → [filePath]` для более умных проверок в будущем.
- Pro: Согласуется с паттерном `lib/` в кодовой базе.
- Con: Нужно написать + протестировать.

**Вариант C: Оставить в `config.js`** — заменить `loadMapIds()` на `loadConfluenceIds()` внутри `config.js`.
- Con: `config.js` становится монолитным. Текущий `config.js` — про env/auth, не про сканирование файлов.

### Решение

**Вариант B.** Создать `lib/confluence.js` с `loadConfluenceIds(repoRoot)`. Удалить `loadMapIds()` и `MAP_FILE` из `config.js`. Согласуется с архитектурой `lib/`.

---

## Сводная таблица решений

| OQ | Решение | Артефакты |
|----|---------|-----------|
| OQ1: soft archive | Физическое перемещение + `status: archived` | Обновить `/archive` |
| OQ2: hybrid search | `qmd query` уже hybrid — только документировать | AGENTS.md routing guide |
| OQ3: check-env | Slash-команда + trigger-правило в AGENTS.md | `/check-env` command |
| OQ4: kg-coverage | Удалить + оставить `health-orphans.js` | Удалить 2 файла, обновить `health-all.js` |
| OQ5: confluence lib | Новый `lib/confluence.js` | Создать + обновить `config.js` и 3 скрипта |

## Открытые вопросы (остаточные)

1. **`/ask` + knowledge-graph.md:** **[VERIFIED]** `/ask` шаг 5 всё ещё обновляет `knowledge-graph.md` при файлинге синтеза. Это нужно убрать в Phase 2 вместе с удалением файла. Вне скопа этого спека — задача для плана Phase 2.
2. **`lib/confluence.js` формат `byFile`:** Нужен ли маппинг `pageId → [filePath]` сразу, или достаточно `Set<pageId>` для Phase 2? **Решение:** начать с `Set<pageId>` — YAGNI. Добавить `byFile` когда появится реальный use-case.
