import { test, expect } from '@playwright/test';
import { uiLogin } from './fixtures/auth';

test.describe('Authentication', () => {
  test('successful login navigates away from login page', async ({ page }) => {
    await uiLogin(page);

    // After a successful login the app redirects to a dashboard/home route.
    // This generic assertion passes as long as the URL is no longer /login.
    // Refine the selector once the exact post-login indicator is known.
    await expect(page).not.toHaveURL(/\/login/);

    // A top-level landmark (nav, main, header) or any visible element should exist.
    await expect(page.locator('body')).toBeVisible();
  });

  test('invalid credentials show an error message', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel(/e-?mail/i).fill('invalid@example.com');
    await page.getByLabel(/senha|password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /entrar|sign in|login/i }).click();

    // The app renders a toast or inline error on failed login.
    // This locator targets common error patterns; refine as needed.
    const errorLocator = page.locator(
      '[role="alert"], .toast, [data-sonner-toast], [data-testid="login-error"]'
    );
    await expect(errorLocator.first()).toBeVisible({ timeout: 10_000 });
  });
});
