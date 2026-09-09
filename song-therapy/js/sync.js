import { MODULE_ID } from "./constants.js";
import { translateSyncError } from "./errors-ru.js";
import { getSupabase, isCloudConfigured } from "./supabase-client.js";
import { defaultState, migrateState, loadLocalState, saveLocalState, stateHasContent } from "./state.js";

let saveTimer = null;
let onStatusChange = null;

export function setSyncStatusCallback(fn) {
  onStatusChange = fn;
}

function setStatus(status, detail = "") {
  onStatusChange?.(status, detail);
}

export async function fetchCloudState(userId) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("user_module_data")
    .select("data")
    .eq("user_id", userId)
    .eq("module_id", MODULE_ID)
    .maybeSingle();

  if (error) throw error;
  if (!data?.data) return null;
  return migrateState({ ...defaultState(), ...data.data });
}

export async function pushCloudState(userId, state) {
  const supabase = getSupabase();
  if (!supabase) return;

  const { error } = await supabase.from("user_module_data").upsert(
    {
      user_id: userId,
      module_id: MODULE_ID,
      data: state,
    },
    { onConflict: "user_id,module_id" }
  );

  if (error) throw error;
  saveLocalState(state);
  setStatus("saved");
}

export function scheduleCloudSave(userId, state) {
  if (!isCloudConfigured() || !userId) return;
  setStatus("saving");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try {
      await pushCloudState(userId, state);
    } catch (err) {
      console.error(err);
      setStatus("error", translateSyncError(err));
    }
  }, 1200);
}

export async function loadRemoteState(userId) {
  if (!isCloudConfigured()) {
    setStatus("offline", "Облако не настроено");
    return { state: migrateState(defaultState()), source: "empty" };
  }

  setStatus("saving", "Загрузка…");
  try {
    const cloud = await fetchCloudState(userId);
    const local = loadLocalState();

    if (cloud && stateHasContent(cloud)) {
      saveLocalState(cloud);
      setStatus("saved");
      return { state: cloud, source: "cloud" };
    }

    if (stateHasContent(local)) {
      await pushCloudState(userId, local);
      setStatus("saved", "Импорт с устройства");
      return { state: local, source: "imported-local" };
    }

    const empty = defaultState();
    setStatus("saved");
    return { state: empty, source: "empty" };
  } catch (err) {
    console.error(err);
    setStatus("error", err.message);
    const fallback = migrateState(defaultState());
    return { state: fallback, source: "error" };
  }
}

export async function resetCloudState(userId) {
  const empty = defaultState();
  if (isCloudConfigured() && userId) {
    await pushCloudState(userId, empty);
  }
  saveLocalState(empty);
  return empty;
}
