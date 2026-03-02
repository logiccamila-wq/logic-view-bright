import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client for use in E2E tests.
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY environment variables.
 * Throws a clear error if they are missing.
 */
export function createTestSupabaseClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      '[E2E] Missing required env var: SUPABASE_URL. ' +
        'Set it in your .env.local or GitHub Actions secrets.'
    );
  }
  if (!anonKey) {
    throw new Error(
      '[E2E] Missing required env var: SUPABASE_ANON_KEY. ' +
        'Set it in your .env.local or GitHub Actions secrets.'
    );
  }

  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
