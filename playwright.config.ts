import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Suite Configuration for Ursa Major Platform.
 * Supports cross-browser execution, mobile emulation, failure traces, and automatic local dev-server detection.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14 Pro'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: process.env.SKIP_WEBSERVER
    ? undefined
    : {
        command: 'npm run start',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120000,
      },
});
