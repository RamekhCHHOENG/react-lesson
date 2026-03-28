import { test, expect, type Page } from '@playwright/test';

const TEST_USER = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  fullName: 'Test User',
};

async function register(page: Page) {
  await page.goto('/register');
  await page.getByPlaceholder(/name/i).fill(TEST_USER.fullName);
  await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/password/i).first().fill(TEST_USER.password);
  await page.getByRole('button', { name: /register|sign up/i }).click();
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill(TEST_USER.email);
  await page.getByPlaceholder(/password/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();
}

test.describe('Authentication', () => {
  test('shows login page for unauthenticated users', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });

  test('can navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /register|sign up|create account/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('shows error for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('invalid@example.com');
    await page.getByPlaceholder(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page.getByText(/invalid|incorrect|error|failed/i)).toBeVisible({ timeout: 5000 });
  });

  test('can register a new account', async ({ page }) => {
    await register(page);
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('can login with registered account', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('can logout', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL('/', { timeout: 5000 });

    // Find and click logout button/link
    const userMenu = page.getByRole('button', { name: /user|profile|avatar/i }).first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }
    await page.getByRole('menuitem', { name: /log out|logout|sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
