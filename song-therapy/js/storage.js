const STORAGE_KEY = "song-therapy-v1";

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed, fields: parsed.fields || {} };
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
    mode: "program", // program | quick
    phaseIndex: 0,
    fields: {},
    completedDays: [],
  };
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

export function exportAll(state) {
  const lines = [
    "=== Песни и терапия — экспорт ===",
    `Дата: ${new Date().toLocaleString("ru-RU")}`,
    `День программы: ${state.currentDay}`,
    `Завершённые дни: ${state.completedDays.join(", ") || "—"}`,
    "",
  ];

  for (const [key, value] of Object.entries(state.fields)) {
    if (!value) continue;
    lines.push(`--- ${key} ---`);
    lines.push(value);
    lines.push("");
  }

  return lines.join("\n");
}
