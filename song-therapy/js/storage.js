const STORAGE_KEY = "song-therapy-v2";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const legacy = localStorage.getItem("song-therapy-v1");
      if (legacy) {
        const parsed = migrateState({ ...defaultState(), ...JSON.parse(legacy), fields: JSON.parse(legacy).fields || {} });
        saveState(parsed);
        return parsed;
      }
      return defaultState();
    }
    const parsed = JSON.parse(raw);
    return migrateState({ ...defaultState(), ...parsed, fields: parsed.fields || {} });
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

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
  };
}

/** Перенос старых d0_write_* в журнал сессий. */
export function migrateState(state) {
  if (!state.quickSessions) state.quickSessions = [];
  if (!state.quickDraft) state.quickDraft = { mood: "", song: "" };

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
