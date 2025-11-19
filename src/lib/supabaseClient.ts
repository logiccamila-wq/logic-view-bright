import { createClient } from "@supabase/supabase-js";

// Lovable Cloud já injeta automaticamente essas duas envs válidas:
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
