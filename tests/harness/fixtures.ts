import { test as baseTest, expect, Page } from '@playwright/test';
import { setupApiMocking, RouteInterceptorOptions } from './route-interceptor';
import { mockEvents, mockNews, mockSeeds } from './mock-data';

export interface TestFixtures {
  mockApi: (options?: RouteInterceptorOptions) => Promise<void>;
  authedAdminPage: Page;
}

export const test = baseTest.extend<TestFixtures>({
  mockApi: async ({ page }, use) => {
    const handler = async (options?: RouteInterceptorOptions) => {
      await setupApiMocking(page, options);
    };
    // By default install standard route mocking
    await handler();
    await use(handler);
  },

  authedAdminPage: async ({ page, context }, use) => {
    // Add moderator auth cookie / header
    await context.addCookies([
      {
        name: 'ursa_admin_session',
        value: 'test-moderator-session-token-valid',
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    await setupApiMocking(page);
    await use(page);
  },
});

export { expect };
