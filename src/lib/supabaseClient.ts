import { createClient } from "@supabase/supabase-js";

// Lê variáveis do ambiente do Lovable (Vite sempre usa import.meta.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL está ausente no ambiente.");
}

if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY está ausente no ambiente.");
}

// Cria o cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
