/** Русские тексты для ошибок Supabase и сети. */

const AUTH_BY_CODE = {
  invalid_credentials: "Неверный email или пароль",
  anonymous_provider_disabled: "Введите email и пароль для регистрации",
  user_already_exists: "Пользователь с таким email уже зарегистрирован",
  email_exists: "Пользователь с таким email уже зарегистрирован",
  email_not_confirmed: "Подтвердите email — проверь почту",
  signup_disabled: "Регистрация временно отключена",
  email_provider_disabled: "Вход по email отключён в настройках",
  weak_password: "Пароль слишком короткий — минимум 6 символов",
  over_request_rate_limit: "Слишком много попыток — подожди минуту",
  over_email_send_rate_limit: "Лимит писем Supabase (~2 в час). Подожди или отключи Confirm email в дашборде",
  session_expired: "Сессия истекла — войди снова",
};

const AUTH_BY_MESSAGE = [
  [/invalid login credentials/i, "Неверный email или пароль"],
  [/anonymous sign-ins are disabled/i, "Введите email и пароль для регистрации"],
  [/user already registered/i, "Пользователь с таким email уже зарегистрирован"],
  [/email not confirmed/i, "Подтвердите email — проверь почту"],
  [/password should be at least/i, "Пароль слишком короткий — минимум 6 символов"],
  [/signup requires a valid password/i, "Пароль слишком короткий — минимум 6 символов"],
  [/unable to validate email address/i, "Некорректный email"],
  [/rate limit/i, "Слишком много попыток — подожди минуту"],
  [/email rate limit/i, "Лимит писем Supabase (~2 в час). Подожди или отключи Confirm email в дашборде"],
  [/redirect.*not allowed/i, "Добавь URL сайта в Supabase → Redirect URLs (for-cursor/**)"],
  [/network/i, "Нет связи с сервером — проверь интернет"],
  [/fetch failed/i, "Нет связи с сервером — проверь интернет"],
];

const SYNC_BY_MESSAGE = [
  [/jwt expired/i, "Сессия истекла — войди снова"],
  [/invalid jwt/i, "Сессия истекла — войди снова"],
  [/row-level security/i, "Нет доступа к данным — войди снова"],
  [/permission denied/i, "Нет доступа к данным"],
  [/failed to fetch/i, "Нет связи с сервером — проверь интернет"],
  [/network/i, "Нет связи с сервером — проверь интернет"],
];

function matchPatterns(message, patterns) {
  for (const [re, text] of patterns) {
    if (re.test(message)) return text;
  }
  return null;
}

export function translateAuthError(err, { isRegister = false } = {}) {
  const code = err?.code || err?.error_code || "";
  if (code && AUTH_BY_CODE[code]) {
    if (code === "anonymous_provider_disabled" && !isRegister) {
      return "Введите email и пароль";
    }
    return AUTH_BY_CODE[code];
  }

  const message = err?.message || "";
  const byMessage = matchPatterns(message, AUTH_BY_MESSAGE);
  if (byMessage) {
    if (/anonymous sign-ins are disabled/i.test(message) && !isRegister) {
      return "Введите email и пароль";
    }
    return byMessage;
  }

  return isRegister ? "Не удалось зарегистрироваться" : "Не удалось войти";
}

export function translateSyncError(err) {
  const message = err?.message || String(err);
  const byMessage = matchPatterns(message, SYNC_BY_MESSAGE);
  if (byMessage) return byMessage;
  return "Ошибка синхронизации";
}
