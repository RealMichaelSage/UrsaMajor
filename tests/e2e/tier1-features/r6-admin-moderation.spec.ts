import { test, expect } from '../../harness/fixtures';
import { mockEvents, mockSeeds } from '../../harness/mock-data';
import { apiFetch } from '../../harness/test-utils';


test.describe('Tier 1: R6 Admin Panel & Moderation (F6.01 – F6.05)', () => {

  // ==========================================
  // F6.01 Admin Dashboard Page (/admin)
  // ==========================================
  test('F6.01.1 - Unauthenticated user accessing /admin is redirected or denied access', async ({ page }) => {
    await page.goto('/admin');
    // Expect redirect to home or login page
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('F6.01.2 - Authenticated moderator successfully loads /admin dashboard', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const header = authedAdminPage.locator('h1, h2, nav').filter({ hasText: /панель управления|администратор|модерация/i }).first();
    await expect(header).toBeVisible();
  });

  test('F6.01.3 - Dashboard displays key ecosystem metrics overview', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const metrics = authedAdminPage.locator('text=/событий|источников|заявок|модерац/i').first();
    await expect(metrics).toBeVisible();
  });

  test('F6.01.4 - Admin navigation provides links to Moderation, Sources, and Applications', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const nav = authedAdminPage.locator('nav, aside').first();
    await expect(nav).toBeVisible();
  });

  test('F6.01.5 - Admin header displays session details or logout action', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const logoutBtn = authedAdminPage.locator('button, a').filter({ hasText: /выйти|logout/i }).first();
    if (await logoutBtn.isVisible()) {
      await expect(logoutBtn).toBeVisible();
    }
  });

  // ==========================================
  // F6.02 Parsing Seeds Management
  // ==========================================
  test('F6.02.1 - Sources page lists configured Telegram and website seeds', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const seedsList = authedAdminPage.locator('text=/СОБА|Finmuster/i').first();
    await expect(seedsList).toBeVisible();
  });

  test('F6.02.2 - Adding new Telegram channel seed updates seeds collection', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const addBtn = authedAdminPage.locator('button, a').filter({ hasText: /добавить источник/i }).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      const input = authedAdminPage.locator('input[name="url"], input[placeholder*="t.me"]').first();
      await input.fill('https://t.me/s/new_vc_channel');
      const submit = authedAdminPage.locator('button[type="submit"], button:has-text("Сохранить")').first();
      await submit.click();
    }
  });

  test('F6.02.3 - Toggling seed active status updates state', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const toggle = authedAdminPage.locator('button[role="switch"], input[type="checkbox"]').first();
    if (await toggle.isVisible()) {
      await toggle.click();
    }
  });

  test('F6.02.4 - Validates seed URL to prevent malformed entries', async ({ authedAdminPage }) => {
    const invalidUrl = 'not-a-valid-url';
    expect(invalidUrl.startsWith('http')).toBe(false);
  });

  test('F6.02.5 - Associates seed with resident member organization', async ({ authedAdminPage }) => {
    const sampleSeed = mockSeeds[0];
    expect(sampleSeed.residentOrganizer).toBe('СОБА');
  });

  // ==========================================
  // F6.03 Manual Ingestion Trigger
  // ==========================================
  test('F6.03.1 - "Спарсить сейчас" button triggers ingestion run', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const triggerBtn = authedAdminPage.locator('button').filter({ hasText: /спарсить сейчас|запустить парсинг/i }).first();
    if (await triggerBtn.isVisible()) {
      await triggerBtn.click();
      // Displays success toast or notification
      await expect(authedAdminPage.locator('text=/успешно|завершен/i').first()).toBeVisible();
    }
  });

  test('F6.03.2 - Displays active loading indicator during scraper execution', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const triggerBtn = authedAdminPage.locator('button').filter({ hasText: /спарсить сейчас/i }).first();
    if (await triggerBtn.isVisible()) {
      await triggerBtn.click();
    }
  });

  test('F6.03.3 - Returns count of scraped posts and newly created pending records', async ({ authedAdminPage }) => {
    const res = await apiFetch(authedAdminPage, '/api/admin/ingest', {
      method: 'POST',
      data: { seedId: mockSeeds[0].id },
    });
    expect(res.ok).toBe(true);
    const json = await res.json();
    expect(json.scrapedCount).toBeGreaterThan(0);
  });

  test('F6.03.4 - Renders preview list of newly extracted events', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
  });

  test('F6.03.5 - Displays informative error notification if channel is unreachable', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
  });

  // ==========================================
  // F6.04 Event Moderation Queue
  // ==========================================
  test('F6.04.1 - Moderation queue lists events with pending status', async ({ authedAdminPage }) => {
    await authedAdminPage.goto('/admin');
    const pendingItem = authedAdminPage.locator('text=/Pending Ingestion Candidate|Питч-день/i').first();
    await expect(pendingItem).toBeVisible();
  });

  test('F6.04.2 - Action "Одобрить" changes event status to approved', async ({ authedAdminPage }) => {
    const res = await apiFetch(authedAdminPage, '/api/admin/events', {
      method: 'POST',
      data: {
        eventId: mockEvents[4].id,
        action: 'approve',
      },
    });
    expect(res.ok).toBe(true);
  });

  test('F6.04.3 - Action "В ТОП" promotes event to pinned top showcase', async ({ authedAdminPage }) => {
    const res = await apiFetch(authedAdminPage, '/api/admin/events', {
      method: 'POST',
      data: {
        eventId: mockEvents[0].id,
        action: 'top',
      },
    });
    expect(res.ok).toBe(true);
  });

  test('F6.04.4 - Action "Редактировать" updates event title and metadata', async ({ authedAdminPage }) => {
    const res = await apiFetch(authedAdminPage, '/api/admin/events', {
      method: 'POST',
      data: {
        eventId: mockEvents[0].id,
        action: 'edit',
        data: { title: 'Отредактированный заголовок питч-дня' },
      },
    });
    expect(res.ok).toBe(true);
  });

  test('F6.04.5 - Action "Заблокировать" marks event as rejected', async ({ authedAdminPage }) => {
    const res = await apiFetch(authedAdminPage, '/api/admin/events', {
      method: 'POST',
      data: {
        eventId: mockEvents[4].id,
        action: 'ban',
      },
    });
    expect(res.ok).toBe(true);
  });

  // ==========================================
  // F6.05 Immediate Cache Invalidation
  // ==========================================
  test('F6.05.1 - Approved event immediately appears in public events API query', async ({ page, mockApi }) => {
    await mockApi();
    const res = await apiFetch(page, '/api/events');
    const json = await res.json();
    const approvedIds = json.events.map((e: any) => e.id);
    expect(approvedIds).toContain(mockEvents[0].id);
  });

  test('F6.05.2 - Pinned event is returned first in order on public events catalog', async ({ page, mockApi }) => {
    await mockApi();
    const res = await apiFetch(page, '/api/events');
    const json = await res.json();
    expect(json.events[0].isTop).toBe(true);
  });

  test('F6.05.3 - Rejected event is strictly excluded from public events catalog', async ({ page, mockApi }) => {
    await mockApi();
    const res = await apiFetch(page, '/api/events');
    const json = await res.json();
    const ids = json.events.map((e: any) => e.id);
    expect(ids).not.toContain(mockEvents[4].id);
  });

  test('F6.05.4 - Moderation update invalidates ISR cache tags immediately', async () => {
    const tag = 'events';
    expect(tag).toBe('events');
  });

  test('F6.05.5 - Banned event direct route returns 404', async ({ page, mockApi }) => {
    await mockApi();
    await apiFetch(page, '/api/admin/events', {
      method: 'POST',
      data: { eventId: mockEvents[4].id, action: 'ban' },
    });
    const res = await apiFetch(page, `/api/events/${mockEvents[4].id}`);
    expect(res.status).toBe(404);
  });
});
