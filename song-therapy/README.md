# Песня — безопасный вход

Терапевтический интерфейс: 14 дней, таймер, быстрый вход, **синхронизация через Supabase** (телефон + ПК).

## Быстрый старт

1. Настрой Supabase — см. [`docs/SUPABASE_SETUP.md`](../docs/SUPABASE_SETUP.md)
2. Локально:

```bash
cd song-therapy
cp js/config.example.js js/config.js
# вставь SUPABASE_URL и SUPABASE_ANON_KEY
python -m http.server 8080
```

3. Открой http://localhost:8080 → создай аккаунт (email + пароль)

## GitLab Pages

Push в GitLab + переменные `SUPABASE_URL` и `SUPABASE_ANON_KEY` в CI/CD. См. `docs/SUPABASE_SETUP.md`.

## Возможности

- 14-дневная программа + быстрый вход
- Журнал сессий быстрого входа
- Облачное сохранение (не localStorage)
- Экспорт `.txt`
- `robots.txt` + noindex

## Структура

```
js/
  auth.js          — вход / регистрация
  sync.js          — Supabase upsert/load
  state.js         — логика состояния
  storage.js       — фасад для app.js
  program.js       — дни программы
supabase/migrations/001_initial.sql
```
