import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

let client = null;

export function isCloudConfigured() {
  return Boolean(SUPABASE_URL?.trim() && SUPABASE_ANON_KEY?.trim());
}

export function getSupabase() {
  if (!isCloudConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL.trim(), SUPABASE_ANON_KEY.trim());
  }
  return client;
}
