import { test, expect } from '@playwright/test';

test.describe('Board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@jira.com');
    await page.getByPlaceholder(/password/i).fill('password');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('can navigate to board page', async ({ page }) => {
    await page.getByRole('link', { name: /board/i }).first().click();
    await expect(page).toHaveURL('/board');
  });

  test('board shows columns', async ({ page }) => {
    await page.goto('/board');
    // Board should show status columns (TODO, IN PROGRESS, DONE, etc.)
    await expect(page.getByText(/todo|to do|backlog/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('can open task detail from board', async ({ page }) => {
    await page.goto('/board');
    // Click on the first task card
    const taskCard = page.locator('[data-testid="task-card"], .task-card, [draggable]').first();
    if (await taskCard.isVisible({ timeout: 5000 })) {
      await taskCard.click();
      // Should navigate to task detail or open a dialog
      await expect(page.getByText(/description|details|assignee/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});
