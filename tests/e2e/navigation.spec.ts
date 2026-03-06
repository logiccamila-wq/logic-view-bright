import { test, expect } from '@playwright/test';
import { supabaseLogin, uiLogin } from './fixtures/auth';

/**
 * Update this list with the actual module routes in the application.
 * Routes come from src/modules/registry.ts — keep this list in sync.
 * Each path will be visited after programmatic login to assert it is accessible.
 */
const MODULE_PATHS = [
  '/dashboard',
  '/drivers-management',
  '/approvals',
  '/logistics-kpi',
  '/reports',
];

test.describe('Protected module navigation', () => {
  test.beforeEach(async ({ page }) => {
    await supabaseLogin(page);
  });

  for (const modulePath of MODULE_PATHS) {
    test(`${modulePath} is accessible when authenticated`, async ({ page }) => {
      await page.goto(modulePath);

      // The page must not show a generic HTTP error indicator.
      const bodyText = await page.locator('body').innerText();
      const lower = bodyText.toLowerCase();

      expect(lower).not.toMatch(/\b401\b/);
      expect(lower).not.toMatch(/\b403\b/);
      expect(lower).not.toMatch(/\b404\b/);
      expect(lower).not.toContain('unauthorized');
      expect(lower).not.toContain('forbidden');
      expect(lower).not.toContain('not found');
    });
  }
});

test.describe('Deep-link redirect', () => {
  test('unauthenticated user is redirected to login on protected route', async ({ page }) => {
    // Visit a protected route without a session
    await page.goto('/dashboard');

    // Should end up on the login page
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('after UI login, user lands on the originally requested route', async ({ page }) => {
    const target = '/dashboard';

    // Go directly to a protected route (no session)
    await page.goto(target);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });

    // Complete UI login
    await uiLogin(page);

    // After login the app should redirect back to the originally requested target
    await expect(page).toHaveURL(target, { timeout: 15_000 });
  });
});
