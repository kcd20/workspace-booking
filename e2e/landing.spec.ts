import { test, expect } from '@playwright/test';

test('landing page renders hero and navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'WorkSpace' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Book a Space' }).first()).toBeVisible();
  await expect(page.getByText('SCROLL TO EXPLORE')).toBeVisible();
});

test('Book a Space CTA navigates to /book', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Book a Space' }).first().click();
  await expect(page).toHaveURL('/book');
});
