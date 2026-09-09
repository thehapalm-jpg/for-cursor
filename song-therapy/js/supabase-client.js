import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

let client = null;

export function isCloudConfigured() {
  return Boolean(SUPABASE_URL?.trim() && SUPABASE_ANON_KEY?.trim());
}

export function isStorageAvailable() {
  try {
    const key = "__storage_test__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function getSupabase() {
  if (!isCloudConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim(), {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
  }
  return client;
}
