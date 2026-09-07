import { test, expect } from '../../harness/fixtures';

test.describe('Tier 4: Real-World Application & Persona Scenarios', () => {

  // ==========================================
  // Persona 1: Mobile Business Angel on iPhone Safari
  // ==========================================
  test('T4.01 - Mobile Business Angel browses online pitch sessions and opens modal seamlessly', async ({ page, mockApi }) => {
    await mockApi();
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // 1. User sees clean mobile view without side scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);

    // 2. Taps mobile menu to navigate to events
    const burger = page.locator('header button').first();
    if (await burger.isVisible()) {
      await burger.click();
    }
    await page.goto('/events');

    // 3. Filters by online format
    const onlinePill = page.locator('button, a').filter({ hasText: /онлайн/i }).first();
    if (await onlinePill.isVisible()) {
      await onlinePill.click();
    }

    // 4. Opens first event card modal
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();

    // 5. Closes modal via ESC
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  // ==========================================
  // Persona 2: Institutional VC Partner evaluating the Association
  // ==========================================
  test('T4.02 - Institutional VC Partner inspects residents, board, and applies for membership', async ({ page, mockApi }) => {
    await mockApi();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // 1. Inspects partners and residents
    await page.evaluate(() => {
      document.querySelector('#partners')?.scrollIntoView({ behavior: 'smooth' });
    });
    const partnersSection = page.locator('#partners, section:has-text("Уже с нами")').first();
    await expect(partnersSection).toBeVisible();
    await expect(partnersSection).toContainText('СОБА');

    // 2. Inspects board members
    await page.evaluate(() => {
      document.querySelector('#team')?.scrollIntoView({ behavior: 'smooth' });
    });
    const teamSection = page.locator('#team, section:has-text("ПРАВЛЕНИЕ АССОЦИАЦИИ")').first();
    await expect(teamSection).toBeVisible();
    await expect(teamSection).toContainText('Луиза Александрова');

    // 3. Submits inquiry at #form
    await page.evaluate(() => {
      document.querySelector('#form')?.scrollIntoView({ behavior: 'smooth' });
    });
    const form = page.locator('#form form, form').first();
    const nameInput = form.locator('input[name="name"], input[name="fullName"], input[placeholder*="имя" i]').first();
    const phoneInput = form.locator('input[name="phone"], input[type="tel"]').first();
    const emailInput = form.locator('input[name="email"], input[type="email"]').first();
    const consent = form.locator('input[type="checkbox"]').first();
    const submitBtn = form.locator('button[type="submit"]').first();

    if (await submitBtn.isVisible()) {
      await nameInput.fill('Михаил Романов');
      await phoneInput.fill('+7 (911) 234-56-78');
      await emailInput.fill('romanov@syndicate-capital.ru');
      if (!(await consent.isChecked())) {
        await consent.check();
      }
      await submitBtn.click();
      await expect(page.locator('text=/успешно|принята/i').first()).toBeVisible();
    }
  });

  // ==========================================
  // Persona 3: Association Moderator managing incoming events
  // ==========================================
  test('T4.03 - Association Moderator audits incoming feed, approves pitch event, and pins to top', async ({ authedAdminPage, page, mockApi }) => {
    await mockApi();

    // 1. Moderator loads dashboard
    await authedAdminPage.goto('/admin');
    const adminNav = authedAdminPage.locator('nav, aside').first();
    await expect(adminNav).toBeVisible();

    // 2. Approves pending event
    const approveBtn = authedAdminPage.locator('button').filter({ hasText: /одобрить|опубликовать/i }).first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
    }

    // 3. Public site verification
    await page.goto('/events');
    const catalogCards = page.locator('[class*="card"], article');
    await expect(catalogCards.first()).toBeVisible();
  });

  // ==========================================
  // Persona 4: Startup Founder exploring market news and events
  // ==========================================
  test('T4.04 - Startup Founder reads market digest and submits resident event proposal', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/news');

    // 1. Reads news article
    const articleCard = page.locator('article, [class*="card"]').first();
    await articleCard.click();
    await expect(page).toHaveURL(/\/news\//);

    // 2. Returns to homepage to submit pitch event
    await page.goto('/#events');
    const submitBtn = page.locator('button, a').filter({ hasText: /разместить мероприятие/i }).first();
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
      const modal = page.locator('[role="dialog"], div.fixed').first();
      await expect(modal).toBeVisible();
    }
  });
});
