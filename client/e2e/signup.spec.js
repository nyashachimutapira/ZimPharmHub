const { test, expect } = require('@playwright/test');

test.describe('Signup flow', () => {
  test('user can register and be redirected to dashboard', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="firstName"]', 'E2E');
    await page.fill('input[name="lastName"]', 'Tester');
    const email = `e2e+${Date.now()}@example.com`;
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    await page.check('input[name="agreeTerms"]');

    await Promise.all([
      page.waitForNavigation({ url: '**/dashboard' }),
      page.click('button:has-text("Create Account")'),
    ]);

    // Check token was stored
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });
});
