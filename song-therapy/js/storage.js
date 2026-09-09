/**
 * Фасад: загрузка/сохранение состояния (облако + локальный кэш).
 */
import { getUserId } from "./auth.js";
import {
  defaultState,
  migrateState,
  loadLocalState,
  saveLocalState,
  stateHasContent,
  getFieldValue,
  setFieldValue,
  getCheckboxValues,
  setCheckboxValues,
  saveQuickSession,
  deleteQuickSession,
  formatSessionDate,
  exportAll,
} from "./state.js";
import { loadRemoteState, scheduleCloudSave, resetCloudState, setSyncStatusCallback } from "./sync.js";
import { isCloudConfigured } from "./supabase-client.js";

export {
  defaultState,
  getFieldValue,
  setFieldValue,
  getCheckboxValues,
  setCheckboxValues,
  saveQuickSession,
  deleteQuickSession,
  formatSessionDate,
  exportAll,
};

export function setSyncUI(callback) {
  setSyncStatusCallback(callback);
}

export async function loadState() {
  const userId = getUserId();
  if (isCloudConfigured() && userId) {
    const { state } = await loadRemoteState(userId);
    return state;
  }
  return loadLocalState();
}

export function saveState(state) {
  saveLocalState(state);
  const userId = getUserId();
  if (isCloudConfigured() && userId) {
    scheduleCloudSave(userId, state);
  }
}

export async function resetState() {
  const userId = getUserId();
  return resetCloudState(userId);
}

export function canUseCloud() {
  return isCloudConfigured();
}
