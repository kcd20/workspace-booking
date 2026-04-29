import { test, expect } from '@playwright/test';

test('auth page renders sign in form', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('toggle to sign up mode', async ({ page }) => {
  await page.goto('/auth');
  await page.getByRole('link', { name: 'Create one' }).click();
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
});

test('unauthenticated user is redirected from /bookings to /auth', async ({ page }) => {
  await page.goto('/bookings');
  await expect(page).toHaveURL('/auth');
});
