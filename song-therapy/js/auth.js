import { getSupabase, isCloudConfigured } from "./supabase-client.js";
import { translateAuthError } from "./errors-ru.js";

let currentSession = null;
const authListeners = [];

export function getSession() {
  return currentSession;
}

export function getUserId() {
  return currentSession?.user?.id ?? null;
}

function notifyAuthListeners(session) {
  authListeners.forEach((fn) => fn(session));
}

export function onSessionChange(callback) {
  authListeners.push(callback);
}

export async function initAuth() {
  if (!isCloudConfigured()) {
    throw new Error(
      "Supabase не настроен. Скопируй js/config.example.js → js/config.js и вставь URL и anon key."
    );
  }

  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  currentSession = data.session;

  supabase.auth.onAuthStateChange((_event, session) => {
    currentSession = session;
    notifyAuthListeners(session);
  });

  return currentSession;
}

export async function signIn(email, password) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentSession = data.session;
  return data.session;
}

export async function signUp(email, password) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  currentSession = data.session;
  return data;
}

export async function resendSignupEmail(email) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
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

export function bindAuthUI() {
  const screen = document.getElementById("auth-screen");
  const shell = document.getElementById("app-shell");
  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const message = document.getElementById("auth-message");
  const btnRegister = document.getElementById("auth-register");
  const btnResend = document.getElementById("auth-resend");
  const btnLogout = document.getElementById("btn-logout");

  let pendingConfirmEmail = null;

  function showMessage(text, isError = false) {
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
    screen.hidden = false;
    shell.hidden = true;
  }

  function showApp() {
    screen.hidden = true;
    shell.hidden = false;
    hideResendButton();
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
      await signIn(email, password);
      showMessage("");
      showApp();
      notifyAuthListeners(getSession());
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
      if (result.session) {
        showMessage("");
        showApp();
        notifyAuthListeners(getSession());
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
    notifyAuthListeners(null);
  });

  onSessionChange((session) => {
    if (session) showApp();
    else showAuth();
  });

  if (currentSession) showApp();
  else showAuth();

  return { showAuth, showApp };
}
