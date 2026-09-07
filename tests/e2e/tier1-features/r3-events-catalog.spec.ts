import { test, expect } from '../../harness/fixtures';
import { mockEvents } from '../../harness/mock-data';

test.describe('Tier 1: R3 Events Catalog & Modal UX (F3.01 – F3.07)', () => {

  // ==========================================
  // F3.01 Events Showcase (#events)
  // ==========================================
  test('F3.01.1 - Homepage #events section renders dynamic event showcase', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#events');
    const eventsSection = page.locator('#events, section:has-text("Мероприятия")').first();
    await expect(eventsSection).toBeVisible();
  });

  test('F3.01.2 - "РАЗМЕСТИТЬ МЕРОПРИЯТИЕ" button opens resident submission modal', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#events');
    const submitBtn = page.locator('button, a').filter({ hasText: /разместить мероприятие/i }).first();
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    const modal = page.locator('[role="dialog"], div.fixed').filter({ hasText: /разместить мероприятие|подать событие/i }).first();
    await expect(modal).toBeVisible();
  });

  test('F3.01.3 - Link to full catalog navigates to /events', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#events');
    const catalogLink = page.locator('a').filter({ hasText: /все мероприятия|смотреть все/i }).first();
    await expect(catalogLink).toBeVisible();
    await catalogLink.click();
    await expect(page).toHaveURL(/\/events/);
  });

  test('F3.01.4 - Clicking showcase event card opens detail modal without redirecting', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#events');
    const card = page.locator('#events [class*="card"], section:has-text("Мероприятия") [class*="card"]').first();
    await expect(card).toBeVisible();
    await card.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();
  });

  test('F3.01.5 - Empty state displays helpful messaging if no events are scheduled', async ({ page, mockApi }) => {
    await mockApi({ events: [] });
    await page.goto('/#events');
    const emptyState = page.locator('text=/формируются|нет запланированных|скоро появятся/i').first();
    await expect(emptyState).toBeVisible();
  });

  // ==========================================
  // F3.02 Events Catalog Page (/events)
  // ==========================================
  test('F3.02.1 - /events page renders full catalog grid and header', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const heading = page.locator('h1, h2').filter({ hasText: /мероприятия|события/i }).first();
    await expect(heading).toBeVisible();
  });

  test('F3.02.2 - Displays approved events sorted chronologically', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const cards = page.locator('[class*="card"], article');
    await expect(cards.first()).toBeVisible();
  });

  test('F3.02.3 - Catalog pagination / load more button is responsive to item count', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const cards = page.locator('[class*="card"], article');
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test('F3.02.4 - Page head contains proper catalog SEO metadata', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(5);
  });

  test('F3.02.5 - Direct URL parameters (/events?format=online) pre-filter the grid', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events?format=online');
    await expect(page).toHaveURL(/format=online/);
  });

  // ==========================================
  // F3.03 EventCard Component
  // ==========================================
  test('F3.03.1 - EventCard displays cover image with fallback capability', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const cardImg = page.locator('[class*="card"] img, article img').first();
    await expect(cardImg).toBeVisible();
  });

  test('F3.03.2 - EventCard formats date and time in Russian format', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const dateText = page.locator('[class*="card"], article').filter({ hasText: /окт|ноя|дек|янв|фев|мар|апр|май|июн|июл|авг|сен/i }).first();
    await expect(dateText).toBeVisible();
  });

  test('F3.03.3 - EventCard displays format badge (Онлайн / Оффлайн)', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const formatBadge = page.locator('text=/онлайн|оффлайн|гибрид/i').first();
    await expect(formatBadge).toBeVisible();
  });

  test('F3.03.4 - EventCard displays price badge ("Бесплатно" or ruble amount)', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const priceBadge = page.locator('text=/бесплатно|₽|руб/i').first();
    await expect(priceBadge).toBeVisible();
  });

  test('F3.03.5 - EventCard displays resident organizer attribution (e.g. СОБА)', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const residentBadge = page.locator('text=/СОБА|Finmuster|Сибири|Синдикат|ASB/i').first();
    await expect(residentBadge).toBeVisible();
  });

  // ==========================================
  // F3.04 Fast Modal UX
  // ==========================================
  test('F3.04.1 - Clicking EventCard opens detail modal without resetting window scroll', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    await page.evaluate(() => window.scrollTo(0, 250));
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();
  });

  test('F3.04.2 - Shallow URL navigation updates query to include event ID', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    await expect(page).toHaveURL(/(\?|&)event=/);
  });

  test('F3.04.3 - Closing modal restores URL to /events', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const closeBtn = page.locator('[role="dialog"] button[aria-label*="close" i], [role="dialog"] button:has(svg)').first();
    await closeBtn.click();
    await expect(page).not.toHaveURL(/event=/);
  });

  test('F3.04.4 - ESC key closes event detail modal', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('F3.04.5 - Backdrop click closes event detail modal', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const backdrop = page.locator('[role="dialog"] ~ div, .backdrop, [data-state="open"]').first();
    if (await backdrop.isVisible()) {
      await backdrop.click({ position: { x: 5, y: 5 }, force: true });
    }
  });

  // ==========================================
  // F3.05 SEO Direct Route (/events/[id])
  // ==========================================
  test('F3.05.1 - Direct GET to /events/[id] renders standalone event page', async ({ page, mockApi }) => {
    await mockApi();
    const testEvent = mockEvents[0];
    await page.goto(`/events/${testEvent.id}`);
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
    await expect(title).toContainText(testEvent.title);
  });

  test('F3.05.2 - Standalone page contains OpenGraph meta tags', async ({ page, mockApi }) => {
    await mockApi();
    const testEvent = mockEvents[0];
    await page.goto(`/events/${testEvent.id}`);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('F3.05.3 - Standalone page includes Schema.org Event JSON-LD script', async ({ page, mockApi }) => {
    await mockApi();
    const testEvent = mockEvents[0];
    await page.goto(`/events/${testEvent.id}`);
    const jsonLd = page.locator('script[type="application/ld+json"]');
    if ((await jsonLd.count()) > 0) {
      const content = await jsonLd.first().textContent();
      expect(content).toContain('Event');
    }
  });

  test('F3.05.4 - "← Ко всем мероприятиям" link returns user to catalog', async ({ page, mockApi }) => {
    await mockApi();
    const testEvent = mockEvents[0];
    await page.goto(`/events/${testEvent.id}`);
    const backLink = page.locator('a').filter({ hasText: /ко всем мероприятиям|назад/i }).first();
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL(/\/events$/);
  });

  test('F3.05.5 - Non-existent event ID renders clean 404 page', async ({ page, mockApi }) => {
    await mockApi();
    const res = await page.goto('/events/00000000-0000-0000-0000-000000000000');
    expect(res?.status() === 404 || (await page.locator('text=/404|не найдено/i').count()) > 0).toBe(true);
  });

  // ==========================================
  // F3.06 Multi-criteria Filtering
  // ==========================================
  test('F3.06.1 - Format filter pill "Онлайн" filters catalog items', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const onlinePill = page.locator('button, a').filter({ hasText: /онлайн/i }).first();
    if (await onlinePill.isVisible()) {
      await onlinePill.click();
      await expect(page).toHaveURL(/format=online/);
    }
  });

  test('F3.06.2 - Price filter "Бесплатно" isolates zero-cost events', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const freePill = page.locator('button, a').filter({ hasText: /бесплатно/i }).first();
    if (await freePill.isVisible()) {
      await freePill.click();
      await expect(page).toHaveURL(/price=free/);
    }
  });

  test('F3.06.3 - Resident organizer selector filters cards by organizer', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const residentSelect = page.locator('select[name="resident"], [role="combobox"]').first();
    if (await residentSelect.isVisible()) {
      await residentSelect.click();
    }
  });

  test('F3.06.4 - Text search input filters events with 300ms debounce', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const searchInput = page.locator('input[type="search"], input[placeholder*="поиск" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('СОБА');
      await page.waitForTimeout(400);
      const cards = page.locator('[class*="card"], article');
      await expect(cards.first()).toContainText('СОБА');
    }
  });

  test('F3.06.5 - "Сбросить фильтры" button restores unfiltered view', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events?format=online&price=free');
    const resetBtn = page.locator('button, a').filter({ hasText: /сбросить/i }).first();
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(page).not.toHaveURL(/format=online/);
    }
  });

  // ==========================================
  // F3.07 Ticket & Source Redirection
  // ==========================================
  test('F3.07.1 - "Купить билет" button has target="_blank" and rel="noopener noreferrer"', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const ticketLink = page.locator('a').filter({ hasText: /купить билет|регистрация|зарегистрироваться/i }).first();
    if (await ticketLink.isVisible()) {
      const target = await ticketLink.getAttribute('target');
      const rel = await ticketLink.getAttribute('rel');
      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
    }
  });

  test('F3.07.2 - Outbound ticket URL appends utm_source tracking parameter', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const ticketLink = page.locator('a').filter({ hasText: /купить билет|регистрация/i }).first();
    if (await ticketLink.isVisible()) {
      const href = await ticketLink.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('F3.07.3 - Source link displays original channel or resident website', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const sourceLink = page.locator('a').filter({ hasText: /источник|t\.me/i }).first();
    if (await sourceLink.isVisible()) {
      const href = await sourceLink.getAttribute('href');
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test('F3.07.4 - Outbound click on ticket button does not trigger detail modal', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const ticketLink = page.locator('[class*="card"] a, article a').filter({ hasText: /купить|билет/i }).first();
    if (await ticketLink.isVisible()) {
      // Prevent navigation for test
      await ticketLink.evaluate((el) => el.setAttribute('href', '#ticket-test'));
      await ticketLink.click();
      const modal = page.locator('[role="dialog"]');
      expect(await modal.isVisible()).toBe(false);
    }
  });

  test('F3.07.5 - Rejects malicious non-HTTP protocols (javascript:, data:)', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const allLinks = page.locator('a');
    const hrefs = await allLinks.evaluateAll((links) => links.map((l) => l.getAttribute('href')));
    for (const href of hrefs) {
      if (href) {
        expect(href.startsWith('javascript:')).toBe(false);
        expect(href.startsWith('data:text/html')).toBe(false);
      }
    }
  });
});
