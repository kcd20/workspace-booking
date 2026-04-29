import { test, expect } from '@playwright/test';

test('floor plan loads with spaces', async ({ page }) => {
  await page.goto('/book');
  await expect(page.locator('svg[aria-label="WorkSpace floor plan"]')).toBeVisible();
  await expect(page.getByText('OPEN HOT DESKS')).toBeVisible();
});

test('booking panel appears when a space is selected', async ({ page }) => {
  await page.goto('/book');
  // Wait for spaces to finish loading (loading badge disappears)
  await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: /D1, available/i }).click();
  await expect(page.getByRole('button', { name: /book now/i })).toBeVisible();
});

test('booking form requires name before submitting', async ({ page }) => {
  await page.goto('/book');
  await expect(page.getByText('Loading…')).not.toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: /D1, available/i }).click();
  await page.getByRole('button', { name: /book now/i }).click();
  await expect(page.getByLabel(/name/i)).toBeFocused();
});
