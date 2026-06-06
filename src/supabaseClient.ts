import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase environment keys are missing. Running in local fallback mode.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
