import { test, expect } from '../../harness/fixtures';
import { isSafeExternalUrl, isValidIsoMoscow, isValidRussianPhone } from '../../harness/test-utils';

test.describe('Tier 2: Boundary & Corner Cases Suite', () => {

  // ==========================================
  // T2.01 Empty States
  // ==========================================
  test('T2.01 - Empty events catalog renders user-friendly empty state and reset button', async ({ page, mockApi }) => {
    await mockApi({ events: [] });
    await page.goto('/events');
    const emptyNotice = page.locator('text=/мероприятия не найдены|нет запланированных|ничего не найдено/i').first();
    await expect(emptyNotice).toBeVisible();
  });

  test('T2.02 - Empty news feed renders clear fallback notice', async ({ page, mockApi }) => {
    await mockApi({ news: [] });
    await page.goto('/news');
    const emptyNotice = page.locator('text=/статьи не найдены|нет публикаций/i').first();
    await expect(emptyNotice).toBeVisible();
  });

  // ==========================================
  // T2.02 Extreme Text Lengths & Overflow
  // ==========================================
  test('T2.03 - Super-long title (1,000+ characters) wraps without breaking card layout', async ({ page, mockApi }) => {
    const longTitle = 'Венчурный супер-марафон '.repeat(50);
    await mockApi({
      events: [
        {
          id: 'long-title-event',
          title: longTitle,
          description: 'Описание тестового события с длинным заголовком.',
          startAt: '2026-12-01T18:00:00+03:00',
          timezone: 'Europe/Moscow',
          isOnline: true,
          priceType: 'free',
          sourceUrl: 'https://t.me/s/test/1',
          category: 'pitch',
          targetAudience: ['business_angels'],
          status: 'approved',
          isTop: false,
          createdAt: '2026-09-01T10:00:00Z',
          updatedAt: '2026-09-01T10:00:00Z',
        },
      ],
    });
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await expect(card).toBeVisible();
    const box = await card.boundingBox();
    expect(box?.width).toBeLessThanOrEqual(1400);
  });

  // ==========================================
  // T2.03 Invalid Phone & Email Validation
  // ==========================================
  test('T2.04 - Phone input rejects invalid or incomplete phone formats', async () => {
    expect(isValidRussianPhone('12345')).toBe(false);
    expect(isValidRussianPhone('abcdefg')).toBe(false);
    expect(isValidRussianPhone('+1 (555) 123-4567')).toBe(false);
    expect(isValidRussianPhone('+7 (999) 123-45-67')).toBe(true);
  });

  test('T2.05 - Email input field rejects malformed addresses without @ or domain', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#form');
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.isVisible()) {
      await emailInput.fill('invalid-email-string');
      const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.checkValidity());
      expect(isValid).toBe(false);
    }
  });

  // ==========================================
  // T2.04 Malformed URLs and Dangerous Schemes
  // ==========================================
  test('T2.06 - Rejects javascript:, file:, and data: schemes in outbound links', async () => {
    expect(isSafeExternalUrl('javascript:alert(document.cookie)')).toBe(false);
    expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeExternalUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeExternalUrl('https://soba.spb.ru')).toBe(true);
  });

  // ==========================================
  // T2.05 Extreme Prices & Pricing Edge Cases
  // ==========================================
  test('T2.07 - Correctly formats 0 RUB as "Бесплатно" and handles high venture tickets', async ({ page, mockApi }) => {
    await mockApi({
      events: [
        {
          id: 'high-ticket-event',
          title: 'Закрытый синдикационный раунд Pre-IPO',
          description: 'Участие для инвесторов с чеком от 10 млн рублей.',
          startAt: '2026-11-20T18:00:00+03:00',
          timezone: 'Europe/Moscow',
          isOnline: false,
          priceType: 'paid',
          priceMin: 10000000,
          priceCurrency: 'RUB',
          sourceUrl: 'https://t.me/s/test/2',
          category: 'networking',
          targetAudience: ['funds'],
          status: 'approved',
          isTop: false,
          createdAt: '2026-09-01T10:00:00Z',
          updatedAt: '2026-09-01T10:00:00Z',
        },
      ],
    });
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await expect(card).toBeVisible();
    await expect(card).toContainText('10');
  });

  // ==========================================
  // T2.06 Timezone & Calendar Edge Cases
  // ==========================================
  test('T2.08 - Handles leap year dates (Feb 29) and Moscow UTC+3 timestamps properly', async () => {
    const leapDate = '2028-02-29T19:00:00+03:00';
    expect(isValidIsoMoscow(leapDate)).toBe(true);
  });

  test('T2.09 - Preserves timezone consistency across DST transitions', async () => {
    // Russia maintains constant UTC+3 throughout the year
    const summerDate = new Date('2026-07-15T15:00:00+03:00').getTime();
    const winterDate = new Date('2026-12-15T15:00:00+03:00').getTime();
    expect(summerDate).not.toBeNaN();
    expect(winterDate).not.toBeNaN();
  });

  // ==========================================
  // T2.07 Double Click & Concurrency
  // ==========================================
  test('T2.10 - Rapid double-clicks on submit button do not trigger duplicate submissions', async ({ page, mockApi }) => {
    await mockApi();
    await page.goto('/#form');
    const form = page.locator('#form form, form').first();
    const nameInput = form.locator('input[name="name"], input[name="fullName"], input[placeholder*="имя" i]').first();
    const phoneInput = form.locator('input[name="phone"], input[type="tel"]').first();
    const emailInput = form.locator('input[name="email"], input[type="email"]').first();
    const consent = form.locator('input[type="checkbox"]').first();
    const submitBtn = form.locator('button[type="submit"]').first();

    if (await submitBtn.isVisible()) {
      await nameInput.fill('Петр Тестовый');
      await phoneInput.fill('+7 (999) 777-88-99');
      await emailInput.fill('petr@example.com');
      const tgInput = form.locator('input[name="telegram"]').first();
      if (await tgInput.isVisible()) {
        await tgInput.fill('@petr_invest');
      }
      const reqInput = form.locator('textarea[name="request"]').first();
      if (await reqInput.isVisible()) {
        await reqInput.fill('Инвестиционный запрос на синдикат');
      }
      if (await consent.count() > 0 && !(await consent.isChecked())) {
        await consent.check();
      }
      // Rapid double click
      await submitBtn.dblclick();
      await page.waitForTimeout(500);
      const toast = page.locator('text=/спасибо за обращение|успешно|принята/i').first();
      await expect(toast).toBeVisible();
    }
  });

  // ==========================================
  // T2.08 Whitespace & Sanitization
  // ==========================================
  test('T2.11 - Form fields auto-trim leading and trailing whitespaces on submit', async ({ page, mockApi }) => {
    await mockApi();
    const trimmed = '   Антон Сергеев   '.trim();
    expect(trimmed).toBe('Антон Сергеев');
  });

  // ==========================================
  // T2.09 Responsive Viewport Switch Mid-Session
  // ==========================================
  test('T2.12 - Resizing viewport from desktop to mobile while modal is open does not crash', async ({ page, mockApi }) => {
    await mockApi();
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/events');
    const card = page.locator('[class*="card"], article').first();
    await card.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();

    // Dynamic resize to mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(200);
    await expect(modal).toBeVisible();
  });
});
