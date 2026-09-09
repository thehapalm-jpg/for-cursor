# 5 минут с телефона (после тренировки)

Код уже в репо. Тебе — только Supabase + два секрета в GitHub.

## 1. Supabase (~3 мин)

1. Открой [supabase.com/dashboard](https://supabase.com/dashboard) → **New project** (бесплатно).
2. Дождись зелёного статуса → **SQL** (слева) → **New query**.
3. С телефона: в GitHub открой файл  
   `supabase/migrations/001_initial.sql` → скопируй всё → вставь в SQL → **Run**.
4. **Authentication** → **Providers** → **Email** → включён.  
   Для себя одного: **Confirm email** → выключи (Settings внутри Email).
5. **Authentication** → **URL Configuration**:
   - **Site URL** → `https://thehapalm-jpg.github.io/for-cursor/` (**обязательно с `/for-cursor/`**, не корень `github.io`!)
   - **Redirect URLs** → `https://thehapalm-jpg.github.io/for-cursor/**`
6. **Project Settings** (шестерёнка) → **API** → скопируй:
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
2. Смержи изменения в ветку **`main`** (через Pull Request). Деплой запускается **только с `main`**, не с feature-веток.
3. После зелёной галочки в **Actions** — **Settings → Pages** — появится URL сайта.

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
- Регистрация просит подтвердить почту → выключи Confirm email в Supabase **или** смени **Site URL** (шаг 5).
- Ссылка из письма ведёт на localhost → **Site URL** = URL GitHub Pages, не localhost.
- После клика по ссылке **404 на github.io** (без `/for-cursor/`) → в **Site URL** забыт путь `/for-cursor/`. Либо открой вручную: `https://thehapalm-jpg.github.io/for-cursor/` + хвост `#access_token=...` из адресной строки.
- **Письмо не приходит** (самое частое):
  1. **Authentication → Providers → Email** → выключи **Confirm email** → регистрация без письма (рекомендуется для одного пользователя).
  2. Или подожди **1 час** — встроенная почта Supabase: ~**2 письма в час** на адрес; много попыток = тишина.
  3. **Authentication → Users** — есть ли пользователь? Если да и не подтверждён — удали и зарегистрируйся снова.
  4. **Authentication → Logs** — ищи `429` / `rate limit`.
  5. Проверь папку **Спам** (отправитель часто `supabase.io`).
