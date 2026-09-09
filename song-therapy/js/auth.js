import { getSupabase, isCloudConfigured, isStorageAvailable } from "./supabase-client.js";
import { translateAuthError } from "./errors-ru.js";

let currentSession = null;
const authListeners = [];

export function getSession() {
  return currentSession;
}

export function getUserId() {
  return currentSession?.user?.id ?? null;
}

function notifyAuthListeners(session, event = null) {
  authListeners.forEach((fn) => {
    try {
      fn(session, event);
    } catch (err) {
      console.error(err);
    }
  });
}

export function onSessionChange(callback) {
  authListeners.push(callback);
}

function setScreenMode(mode) {
  const screen = document.getElementById("auth-screen");
  const shell = document.getElementById("app-shell");
  if (!screen || !shell) return;

  if (mode === "app") {
    screen.setAttribute("hidden", "");
    shell.removeAttribute("hidden");
  } else {
    screen.removeAttribute("hidden");
    shell.setAttribute("hidden", "");
  }
}

async function refreshSession() {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;
  return currentSession;
}

export async function initAuth() {
  if (!isCloudConfigured()) {
    throw new Error(
      "Supabase не настроен. Скопируй js/config.example.js → js/config.js и вставь URL и anon key."
    );
  }

  if (!isStorageAvailable()) {
    throw new Error(
      "Браузер блокирует localStorage — без него вход не сохранится. Отключи режим инкогнито или блокировку cookies."
    );
  }

  const supabase = getSupabase();

  if (window.location.hash.includes("access_token")) {
    await refreshSession();
    if (currentSession) {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  } else {
    await refreshSession();
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      currentSession = session;
      notifyAuthListeners(session, event);
    } else if (event === "SIGNED_OUT") {
      currentSession = null;
      notifyAuthListeners(null, event);
    }
  });

  return currentSession;
}

export async function signIn(email, password) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  currentSession = data.session ?? (await refreshSession());
  if (!currentSession) {
    const err = new Error("session missing");
    err.code = "session_missing";
    throw err;
  }
  return currentSession;
}

export function getAuthRedirectUrl() {
  const { origin, pathname } = window.location;
  const dir = pathname.endsWith("/") ? pathname : `${pathname.replace(/\/[^/]*$/, "/")}`;
  return `${origin}${dir}`;
}

export async function signUp(email, password) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
  currentSession = data.session ?? (await refreshSession());
  return data;
}

export async function resendSignupEmail(email) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: getAuthRedirectUrl() },
  });
  if (error) throw error;
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  currentSession = null;
}

function isAlreadyRegistered(data) {
  return data?.user?.identities?.length === 0;
}

export function bindAuthUI({ onEnterApp } = {}) {
  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const message = document.getElementById("auth-message");
  const btnRegister = document.getElementById("auth-register");
  const btnResend = document.getElementById("auth-resend");
  const btnLogout = document.getElementById("btn-logout");

  let pendingConfirmEmail = null;

  function showMessage(text, isError = false) {
    if (!message) return;
    message.textContent = text;
    message.className = isError ? "auth-message error" : "auth-message";
  }

  function showResendButton(email) {
    pendingConfirmEmail = email;
    if (btnResend) btnResend.hidden = false;
  }

  function hideResendButton() {
    pendingConfirmEmail = null;
    if (btnResend) btnResend.hidden = true;
  }

  function showAuth() {
    setScreenMode("auth");
  }

  function showApp() {
    setScreenMode("app");
    hideResendButton();
  }

  async function onLoginSuccess(session) {
    if (!session) {
      showMessage(translateAuthError({ code: "session_missing" }), true);
      return;
    }
    setScreenMode("app");
    hideResendButton();
    showMessage("");
    try {
      await onEnterApp?.(session);
    } catch (err) {
      console.error(err);
      showMessage("Вошли, но не удалось загрузить данные — обнови страницу", true);
    }
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showMessage("Введите email и пароль", true);
      return;
    }
    hideResendButton();
    showMessage("Вход…");
    try {
      const session = await signIn(email, password);
      await onLoginSuccess(session);
    } catch (err) {
      showMessage(translateAuthError(err, { isRegister: false }), true);
    }
  });

  btnRegister?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showMessage("Введите email и пароль для регистрации", true);
      return;
    }
    if (password.length < 6) {
      showMessage("Пароль — минимум 6 символов", true);
      return;
    }
    hideResendButton();
    showMessage("Регистрация…");
    try {
      const result = await signUp(email, password);
      if (isAlreadyRegistered(result)) {
        showMessage(
          "Этот email уже зарегистрирован. Войди с паролем или удали пользователя в Supabase → Users",
          true
        );
        return;
      }
      if (result.session || getSession()) {
        await onLoginSuccess(getSession());
      } else {
        showResendButton(email);
        showMessage(
          "Письмо отправлено (если не пришло за 2 мин — проверь «Спам» или нажми «Отправить письмо ещё раз»). Лимит Supabase: ~2 письма в час на адрес"
        );
      }
    } catch (err) {
      showMessage(translateAuthError(err, { isRegister: true }), true);
    }
  });

  btnResend?.addEventListener("click", async () => {
    const email = pendingConfirmEmail || emailInput.value.trim();
    if (!email) {
      showMessage("Введите email", true);
      return;
    }
    showMessage("Отправляем письмо…");
    try {
      await resendSignupEmail(email);
      showResendButton(email);
      showMessage("Письмо отправлено повторно. Проверь входящие и «Спам»");
    } catch (err) {
      showMessage(translateAuthError(err, { isRegister: true }), true);
    }
  });

  btnLogout?.addEventListener("click", async () => {
    await signOut();
    showAuth();
    notifyAuthListeners(null, "SIGNED_OUT");
  });

  onSessionChange((session, event) => {
    if (session) setScreenMode("app");
    else if (event === "SIGNED_OUT") showAuth();
  });

  if (currentSession) setScreenMode("app");
  else showAuth();

  return { showAuth, showApp };
}
