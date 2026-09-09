# Настройка Supabase + деплой

**Быстрый путь с телефона:** [`SETUP_5MIN.md`](SETUP_5MIN.md)

Репозиторий на **GitHub** — деплой через **GitHub Pages** (workflow `.github/workflows/pages.yml`).  
GitLab CI (`.gitlab-ci.yml`) — если используешь зеркало на GitLab.

---

# Настройка Supabase + GitHub Pages

## 1. Supabase (бесплатно)

1. Зарегистрируйся на [supabase.com](https://supabase.com) → **New project**.
2. **SQL Editor** → вставь содержимое `supabase/migrations/001_initial.sql` → **Run**.
3. **Authentication → Providers → Email**: включи Email, при желании отключи «Confirm email» (для личного use проще).
4. **Project Settings → API**: скопируй **Project URL** и **anon public** key.

## 2. Локально (Windows / Mac)

```bash
cd song-therapy
cp js/config.example.js js/config.js
```

В `js/config.js` вставь URL и anon key.

```bash
python -m http.server 8080
```

Открой http://localhost:8080 → **Создать аккаунт** → войди с телефона/ПК под тем же email.

### Импорт с localStorage

Если в браузере уже были данные (старая версия), при **первом входе** они автоматически загрузятся в облако, если облако пустое.

## 3. GitHub Pages (основной способ)

1. Репо → **Settings → Secrets and variables → Actions**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. **Settings → Pages** → Source: **GitHub Actions**.
3. Push в `main` или **Actions → Deploy song-therapy to Pages → Run workflow**.
4. URL в **Settings → Pages**.

### GitLab Pages (альтернатива)

1. Зеркало на GitLab → **CI/CD → Variables**: те же два ключа.
2. Pipeline **pages** из `.gitlab-ci.yml`.

### Поисковики

В проекте уже есть `song-therapy/robots.txt` и `<meta name="robots" content="noindex">`.

## 4. Безопасность

- **anon key** в фронте — нормально: доступ только к своим строкам через **RLS**.
- **service_role** key никогда не вставляй в фронт.
- Пароль — минимум 6 символов (настройка Supabase).

## 5. Новые модули (позже)

В БД одна таблица `user_module_data` с полем `module_id`. Новая тренировка = новый `module_id` в `js/constants.js` и свой UI в `modules/`.
