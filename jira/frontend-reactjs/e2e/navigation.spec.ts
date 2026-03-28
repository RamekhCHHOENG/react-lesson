import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@jira.com');
    await page.getByPlaceholder(/password/i).fill('password');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('dashboard loads', async ({ page }) => {
    await expect(page.getByText(/dashboard|overview|welcome/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('can navigate to backlog', async ({ page }) => {
    await page.getByRole('link', { name: /backlog/i }).first().click();
    await expect(page).toHaveURL('/backlog');
  });

  test('can navigate to sprints', async ({ page }) => {
    await page.getByRole('link', { name: /sprint/i }).first().click();
    await expect(page).toHaveURL('/sprints');
  });

  test('can navigate to settings', async ({ page }) => {
    await page.getByRole('link', { name: /settings/i }).first().click();
    await expect(page).toHaveURL('/settings');
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/some-nonexistent-page');
    await expect(page.getByText(/not found|404/i).first()).toBeVisible({ timeout: 5000 });
  });
});
