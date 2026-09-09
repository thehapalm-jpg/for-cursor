# 5 минут с телефона (после тренировки)

Код уже в репо. Тебе — только Supabase + два секрета в GitHub.

## 1. Supabase (~3 мин)

1. Открой [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (бесплатно).
2. Дождись зелёного статуса → **SQL** (слева) → **New query**.
3. С телефона: в GitHub открой файл  
   `supabase/migrations/001_initial.sql` → скопируй всё → вставь в SQL → **Run**.
4. **Authentication** → **Providers** → **Email** → включён.  
   Для себя одного: **Confirm email** → выключи (Settings внутри Email).
5. **Project Settings** (шестерёнка) → **API** → скопируй:
   - **Project URL**
   - **anon public** (не service_role!)

## 2. GitHub Secrets (~1 мин)

Репо `thehapalm-jpg/for-cursor` → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**:

| Name | Value |
|------|--------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_ANON_KEY` | anon public key |

## 3. GitHub Pages (~1 мин)

1. **Settings** → **Pages** → **Build and deployment** → Source: **GitHub Actions**.
2. **Actions** → workflow **Deploy song-therapy to Pages** → **Run workflow** (или дождись push в `main`).
3. После зелёной галочки — **Settings → Pages** — появится URL сайта.

## 4. Первый вход

Открой URL с телефона → **Создать аккаунт** (свой email + пароль).

Если на ПК в браузере остались старые данные (localStorage) — зайди там под **тем же** аккаунтом: они импортируются в облако автоматически.

---

## Локально (опционально)

```bash
cd song-therapy
copy js\config.example.js js\config.js
```

Вставь те же URL и anon key → `python -m http.server 8080`.

---

## Если что-то не так

- Сайт открывается, но alert «Supabase не настроен» → секреты не заданы или workflow не перезапускался.
- «Invalid API key» → в секрет попал service_role вместо anon.
- Регистрация просит подтвердить почту → выключи Confirm email в Supabase.
