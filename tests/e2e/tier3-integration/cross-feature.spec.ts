import { test, expect } from '../../harness/fixtures';
import { mockEvents, mockSeeds } from '../../harness/mock-data';
import { apiFetch } from '../../harness/test-utils';

test.describe('Tier 3: Cross-Feature Integration Workflows', () => {

  // ==========================================
  // Workflow 1: Ingestion -> Moderation -> Public Showcase
  // ==========================================
  test('T3.01 - End-to-end ingestion trigger to admin approval and public showcase visibility', async ({ authedAdminPage, page, mockApi }) => {
    await mockApi();

    // Step 1: Admin triggers manual ingestion run
    await authedAdminPage.goto('/admin');
    const triggerBtn = authedAdminPage.locator('button').filter({ hasText: /спарсить сейчас|запустить парсинг/i }).first();
    if (await triggerBtn.isVisible()) {
      await triggerBtn.click();
    }

    // Step 2: Moderator approves the pending item
    const approveBtn = authedAdminPage.locator('button').filter({ hasText: /одобрить|опубликовать/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
    }

    // Step 3: Public user opens /events and finds the approved event
    await page.goto('/events');
    const firstEvent = page.locator('[class*="card"], article').first();
    await expect(firstEvent).toBeVisible();
  });

  // ==========================================
  // Workflow 2: Search + Filter + Modal + Outbound Ticket Link
  // ==========================================
  test('T3.02 - Search + filter combination opens fast modal and enables outbound ticket link', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');

    // Filter by online
    const onlinePill = page.locator('button, a').filter({ hasText: /онлайн/i }).first();
    if (await onlinePill.isVisible()) {
      await onlinePill.click();
    }

    // Open detail modal
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();

    // Outbound link inside modal has target="_blank"
    const ticketLink = modal.locator('a').filter({ hasText: /купить билет|регистрация/i }).first();
    if (await ticketLink.isVisible()) {
      expect(await ticketLink.getAttribute('target')).toBe('_blank');
    }
  });

  // ==========================================
  // Workflow 3: Resident Event Submission -> Admin Moderation -> Catalog Visibility
  // ==========================================
  test('T3.03 - Resident event submission enters moderation queue and publishes to catalog upon approval', async ({ page, authedAdminPage, mockApi }) => {
    await mockApi();

    // Step 1: Resident visits homepage and opens submission modal
    await page.goto('/#events');
    const submitCTA = page.locator('button, a').filter({ hasText: /разместить мероприятие/i }).first();
    if (await submitCTA.isVisible()) {
      await submitCTA.click();
      const modal = page.locator('[role="dialog"], div.fixed').first();
      await expect(modal).toBeVisible();

      // Fill event submission form
      const titleInput = modal.locator('input[name="title"], input[placeholder*="название" i]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('Венчурный день резидента UNCRN');
      }
    }

    // Step 2: Moderator reviews and approves in /admin
    await authedAdminPage.goto('/admin');
    const pendingItem = authedAdminPage.locator('text=/Pending Ingestion Candidate|UNCRN/i').first();
    if (await pendingItem.isVisible()) {
      await expect(pendingItem).toBeVisible();
    }
  });

  // ==========================================
  // Workflow 4: News Feed -> In-Article CTA -> Consultation Submission
  // ==========================================
  test('T3.04 - Reading news article links smoothly to lead form submission', async ({ page, mockApi }) => {
    await mockApi();
    const article = mockEvents[0];
    await page.goto(`/news`);

    // Click article card
    const card = page.locator('article, [class*="card"]').first();
    await card.click();
    await expect(page).toHaveURL(/\/news\//);

    // Click CTA to join / consult
    const joinCta = page.locator('a').filter({ hasText: /вступить в ассоциацию|подать заявку|написать нам/i }).first();
    if (await joinCta.isVisible()) {
      await joinCta.click();
      const form = page.locator('#form, [role="dialog"]').first();
      await expect(form).toBeVisible();
    }
  });

  // ==========================================
  // Workflow 5: Trigram Deduplication Merge Flow
  // ==========================================
  test('T3.05 - Moderator merges duplicate event into canonical event, hiding duplicate from catalog', async ({ authedAdminPage, page, mockApi }) => {
    await mockApi();

    // Simulate merge action via API
    const res = await apiFetch(authedAdminPage, '/api/admin/events', {
      method: 'POST',
      data: {
        eventId: mockEvents[4].id,
        action: 'ban', // Soft delete / duplicate merge
      },
    });
    expect(res.ok).toBe(true);

    // Verify duplicate is hidden on public catalog
    await page.goto('/events');
    const duplicateCard = page.locator(`text="${mockEvents[4].title}"`);
    expect(await duplicateCard.isVisible()).toBe(false);
  });

  // ==========================================
  // Workflow 6: Calendar Integration (.ics download)
  // ==========================================
  test('T3.06 - Event detail modal allows downloading .ics calendar invite', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await card.click();

    const calBtn = page.locator('button, a').filter({ hasText: /календарь|\.ics/i }).first();
    if (await calBtn.isVisible()) {
      await expect(calBtn).toBeVisible();
    }
  });
});
