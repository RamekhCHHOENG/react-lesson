import { test, expect } from '@playwright/test';

// These tests assume the backend is running with seeded data
// Seed user: admin@jira.com / password

test.describe('Projects', () => {
  test.beforeEach(async ({ page }) => {
    // Login with seeded user
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@jira.com');
    await page.getByPlaceholder(/password/i).fill('password');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('can navigate to projects page', async ({ page }) => {
    await page.getByRole('link', { name: /projects/i }).first().click();
    await expect(page).toHaveURL('/projects');
    await expect(page.getByText(/projects/i).first()).toBeVisible();
  });

  test('can view project list', async ({ page }) => {
    await page.goto('/projects');
    // Should have at least the seeded projects
    await expect(page.locator('[data-testid="project-card"], table tbody tr, .project-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('can open create project dialog', async ({ page }) => {
    await page.goto('/projects');
    await page.getByRole('button', { name: /create|new|add/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });
});
