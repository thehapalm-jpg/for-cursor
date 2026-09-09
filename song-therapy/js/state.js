import { LOCAL_LEGACY_KEY, LOCAL_STORAGE_KEY } from "./constants.js";
import { formatCompiledSongs } from "./song-compiler.js";

export function defaultState() {
  return {
    programStart: null,
    currentDay: 1,
    mode: "program",
    phaseIndex: 0,
    fields: {},
    completedDays: [],
    quickSessions: [],
    quickDraft: { mood: "", song: "" },
    songStanzas: [],
  };
}

export function migrateState(state) {
  if (!state.quickSessions) state.quickSessions = [];
  if (!state.quickDraft) state.quickDraft = { mood: "", song: "" };
  if (!state.fields) state.fields = {};
  if (!state.completedDays) state.completedDays = [];
  if (!state.songStanzas) state.songStanzas = [];

  const oldMood = state.fields?.["d0_write_mood"] ?? "";
  const oldSong = state.fields?.["d0_write_song"] ?? "";
  if (oldMood || oldSong) {
    const alreadyMigrated = state.quickSessions.some((s) => s.migratedFromV1);
    if (!alreadyMigrated) {
      state.quickSessions.unshift({
        id: `migrated-${Date.now()}`,
        savedAt: new Date().toISOString(),
        mood: oldMood,
        song: oldSong,
        migratedFromV1: true,
      });
    }
    delete state.fields["d0_write_mood"];
    delete state.fields["d0_write_song"];
  }

  return state;
}

export function loadLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LOCAL_LEGACY_KEY);
      if (legacy) {
        const parsed = migrateState({
          ...defaultState(),
          ...JSON.parse(legacy),
          fields: JSON.parse(legacy).fields || {},
        });
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        return parsed;
      }
      return defaultState();
    }
    return migrateState({ ...defaultState(), ...JSON.parse(raw), fields: JSON.parse(raw).fields || {} });
  } catch {
    return defaultState();
  }
}

export function saveLocalState(state) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export function stateHasContent(state) {
  if (!state) return false;
  if (state.currentDay > 1) return true;
  if (state.completedDays?.length) return true;
  if (state.quickSessions?.length) return true;
  if (state.quickDraft?.mood?.trim() || state.quickDraft?.song?.trim()) return true;
  if (state.songStanzas?.length) return true;
  if (Object.values(state.fields || {}).some((v) => String(v).trim())) return true;
  return false;
}

export function fieldKey(day, phaseId, fieldId) {
  return `d${day}_${phaseId}_${fieldId}`;
}

export function getFieldValue(state, day, phaseId, fieldId) {
  return state.fields[fieldKey(day, phaseId, fieldId)] ?? "";
}

export function setFieldValue(state, day, phaseId, fieldId, value) {
  state.fields[fieldKey(day, phaseId, fieldId)] = value;
}

export function getCheckboxValues(state, day, phaseId, fieldId) {
  const raw = getFieldValue(state, day, phaseId, fieldId);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setCheckboxValues(state, day, phaseId, fieldId, values) {
  setFieldValue(state, day, phaseId, fieldId, JSON.stringify(values));
}

export function saveQuickSession(state) {
  const { mood, song } = state.quickDraft;
  if (!mood.trim() && !song.trim()) return false;

  state.quickSessions.unshift({
    id: `q-${Date.now()}`,
    savedAt: new Date().toISOString(),
    mood: mood.trim(),
    song: song.trim(),
  });
  state.quickDraft = { mood: "", song: "" };
  return true;
}

export function deleteQuickSession(state, sessionId) {
  const idx = state.quickSessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return false;
  state.quickSessions.splice(idx, 1);
  return true;
}

export function formatSessionDate(iso) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function exportAll(state) {
  const lines = [
    "=== Песни и терапия — экспорт ===",
    `Дата экспорта: ${new Date().toLocaleString("ru-RU")}`,
    `День программы: ${state.currentDay}`,
    `Завершённые дни: ${state.completedDays.join(", ") || "—"}`,
    "",
  ];

  if (state.quickSessions?.length) {
    lines.push("=== Быстрый вход — сохранённые сессии ===");
    state.quickSessions.forEach((s, i) => {
      lines.push(`--- Сессия ${state.quickSessions.length - i} · ${formatSessionDate(s.savedAt)} ---`);
      if (s.mood) lines.push(`Настроение: ${s.mood}`);
      lines.push(s.song || "(без текста песни)");
      lines.push("");
    });
  }

  const draftMood = state.quickDraft?.mood?.trim();
  const draftSong = state.quickDraft?.song?.trim();
  if (draftMood || draftSong) {
    lines.push("=== Быстрый вход — текущий черновик (не сохранён) ===");
    if (draftMood) lines.push(`Настроение: ${draftMood}`);
    lines.push(draftSong || "");
    lines.push("");
  }

  if (state.songStanzas?.length) {
    lines.push("=== Сборка песен ===");
    lines.push(formatCompiledSongs(state.songStanzas));
    lines.push("");
  }

  lines.push("=== Дни программы ===");
  const programKeys = Object.keys(state.fields).filter((k) => !k.startsWith("d0_")).sort();
  for (const key of programKeys) {
    const value = state.fields[key];
    if (!value) continue;
    lines.push(`--- ${key} ---`);
    lines.push(value);
    lines.push("");
  }

  return lines.join("\n");
}
