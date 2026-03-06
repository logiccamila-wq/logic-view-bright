import { Page } from '@playwright/test';
import { createTestSupabaseClient } from '../lib/supabase-client';

const STORAGE_KEY_PREFIX = 'sb-';

/**
 * Programmatic login via Supabase password grant.
 * Stores the session in localStorage using the supabase-js v2 format so the
 * app picks it up on the next navigation without going through the UI.
 *
 * Requires TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD, SUPABASE_URL, and
 * SUPABASE_ANON_KEY environment variables.
 */
export async function supabaseLogin(page: Page): Promise<void> {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      '[E2E] Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD env vars.'
    );
  }

  const client = createTestSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw new Error(`[E2E] Supabase login failed: ${error?.message ?? 'no session returned'}`);
  }

  const { session } = data;

  const supabaseUrl = process.env.SUPABASE_URL!;

  // Derive the storage key from the project URL (supabase-js v2 convention)
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const storageKey = `${STORAGE_KEY_PREFIX}${projectRef}-auth-token`;

  const sessionPayload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    user: session.user,
  });

  // Navigate to baseURL first so localStorage is available on the correct origin
  await page.goto('/');
  await page.evaluate(
    ({ key, value }) => localStorage.setItem(key, value),
    { key: storageKey, value: sessionPayload }
  );
}

/**
 * UI login via the login form.
 * Fills the email/password fields and submits the form.
 */
export async function uiLogin(page: Page, loginPath = '/login'): Promise<void> {
  const email = process.env.TEST_ADMIN_EMAIL;
  const password = process.env.TEST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      '[E2E] Missing TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD env vars.'
    );
  }

  await page.goto(loginPath);

  await page.getByLabel(/e-?mail/i).fill(email);
  await page.getByLabel(/senha|password/i).fill(password);
  await page.getByRole('button', { name: /entrar|sign in|login/i }).click();
}
