import { getSupabase, isCloudConfigured } from "./supabase-client.js";

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

export async function signOut() {
  const supabase = getSupabase();
  await supabase.auth.signOut();
  currentSession = null;
}

export function bindAuthUI() {
  const screen = document.getElementById("auth-screen");
  const shell = document.getElementById("app-shell");
  const form = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const message = document.getElementById("auth-message");
  const btnRegister = document.getElementById("auth-register");
  const btnLogout = document.getElementById("btn-logout");

  function showMessage(text, isError = false) {
    message.textContent = text;
    message.className = isError ? "auth-message error" : "auth-message";
  }

  function showAuth() {
    screen.hidden = false;
    shell.hidden = true;
  }

  function showApp() {
    screen.hidden = true;
    shell.hidden = false;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showMessage("Введи email и пароль.", true);
      return;
    }
    showMessage("Вход…");
    try {
      await signIn(email, password);
      showMessage("");
      showApp();
      notifyAuthListeners(getSession());
    } catch (err) {
      showMessage(err.message || "Ошибка входа", true);
    }
  });

  btnRegister?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showMessage("Введи email и пароль.", true);
      return;
    }
    if (password.length < 6) {
      showMessage("Пароль — минимум 6 символов.", true);
      return;
    }
    showMessage("Регистрация…");
    try {
      const result = await signUp(email, password);
      if (result.session) {
        showMessage("");
        showApp();
        notifyAuthListeners(getSession());
      } else {
        showMessage("Проверь почту — возможно, нужно подтвердить регистрацию.");
      }
    } catch (err) {
      showMessage(err.message || "Ошибка регистрации", true);
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
  // initial UI state after listeners registered

  if (currentSession) showApp();
  else showAuth();

  return { showAuth, showApp };
}
