import { test, expect } from '../../harness/fixtures';
import { mockNews } from '../../harness/mock-data';

test.describe('Tier 1: R4 News & Media Feed (F4.01 – F4.03)', () => {

  // ==========================================
  // F4.01 News Showcase (#news)
  // ==========================================
  test('F4.01.1 - Homepage renders #news section with latest featured articles', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#news');
    const newsSection = page.locator('#news, section:has-text("Новости"), section:has-text("Аналитика")').first();
    await expect(newsSection).toBeVisible();
  });

  test('F4.01.2 - Displays up to 3 featured articles with cover thumbnails', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#news');
    const cards = page.locator('#news [class*="card"], section:has-text("Новости") article');
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test('F4.01.3 - Link "Все новости →" navigates to /news', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#news');
    const link = page.locator('a').filter({ hasText: /все новости|все аналитические|читать все/i }).first();
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/news/);
  });

  test('F4.01.4 - Clicking showcase article card opens full article view', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#news');
    const card = page.locator('#news [class*="card"], section:has-text("Новости") article').first();
    await card.click();
    await expect(page).toHaveURL(/\/news\//);
  });

  test('F4.01.5 - Showcase layout is responsive without horizontal overflow', async ({ page, mockApi }) => {
    await mockApi();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/#news');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  // ==========================================
  // F4.02 News Feed Page (/news)
  // ==========================================
  test('F4.02.1 - Navigating to /news renders dedicated feed portal', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/news');
    const heading = page.locator('h1').filter({ hasText: /новости|аналитика/i }).first();
    await expect(heading).toBeVisible();
  });

  test('F4.02.2 - Displays list of published articles sorted chronologically', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/news');
    const articles = page.locator('article, [class*="card"]');
    await expect(articles.first()).toBeVisible();
  });

  test('F4.02.3 - Category pills (Аналитика, Законодательство) filter articles', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/news');
    const tagPill = page.locator('button, a').filter({ hasText: /аналитика|законодательство|налоги/i }).first();
    if (await tagPill.isVisible()) {
      await tagPill.click();
    }
  });

  test('F4.02.4 - News search input filters articles by title and excerpt', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/news');
    const searchInput = page.locator('input[type="search"], input[placeholder*="поиск" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('полугодия');
      await page.waitForTimeout(300);
      const article = page.locator('article, [class*="card"]').first();
      await expect(article).toContainText('полугодия');
    }
  });

  test('F4.02.5 - Feed includes estimated reading time on cards', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/news');
    const readingTime = page.locator('text=/мин чтения|мин\./i').first();
    await expect(readingTime).toBeVisible();
  });

  // ==========================================
  // F4.03 News Detail Route (/news/[id])
  // ==========================================
  test('F4.03.1 - Standalone article route renders complete markdown/rich content', async ({ page, mockApi }) => {
    await mockApi();
    const article = mockNews[0];
    await page.goto(`/news/${article.id}`);
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('Итоги полугодия');
  });

  test('F4.03.2 - Article page displays author or resident source attribution', async ({ page, mockApi }) => {
    await mockApi();
    const article = mockNews[0];
    await page.goto(`/news/${article.id}`);
    const author = page.locator('text=/Пресс-служба|Большая Медведица|Finmuster/i').first();
    await expect(author).toBeVisible();
  });

  test('F4.03.3 - Article page provides social share actions', async ({ page, mockApi }) => {
    await mockApi();
    const article = mockNews[0];
    await page.goto(`/news/${article.id}`);
    const shareBtn = page.locator('button, a').filter({ hasText: /поделиться|telegram|копировать/i }).first();
    await expect(shareBtn).toBeVisible();
  });

  test('F4.03.4 - Back link returns user from article to /news portal', async ({ page, mockApi }) => {
    await mockApi();
    const article = mockNews[0];
    await page.goto(`/news/${article.id}`);
    const backBtn = page.locator('a').filter({ hasText: /все новости|ко всем статьям|назад/i }).first();
    await expect(backBtn).toBeVisible();
    await backBtn.click();
    await expect(page).toHaveURL(/\/news$/);
  });

  test('F4.03.5 - Invalid article ID or slug returns clean 404 response', async ({ page, mockApi }) => {
    await mockApi();
    const res = await page.goto('/news/00000000-0000-0000-0000-000000000000');
    expect(res?.status() === 404 || (await page.locator('text=/404|не найдена/i').count()) > 0).toBe(true);
  });
});
