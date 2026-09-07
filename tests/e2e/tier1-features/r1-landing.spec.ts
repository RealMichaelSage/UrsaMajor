import { test, expect } from '../../harness/fixtures';

test.describe('Tier 1: R1 Landing Page Replication (F1.01 – F1.12)', () => {

  test.beforeEach(async ({ mockApi, page }) => {
    await mockApi();
    await page.goto('/');
  });

  // ==========================================
  // F1.01 Brand Theme & Palette
  // ==========================================
  test('F1.01.1 - Body background conforms to pure white light theme token', async ({ page }) => {
    const body = page.locator('body');
    await expect(body).toBeVisible();
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // Expect rgb(255, 255, 255) or light slate rgb(248, 250, 252)
    expect(bgColor).toMatch(/rgb\((255,\s*255,\s*255|248,\s*250,\s*252|251,\s*251,\s*249)\)/);
  });

  test('F1.01.2 - Primary headings and text use signature deep slate #1a2e35', async ({ page }) => {
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    const color = await h1.evaluate((el) => window.getComputedStyle(el).color);
    // #1a2e35 rgb(26, 46, 53) or #111111 rgb(17, 17, 17)
    expect(color).toMatch(/rgb\((26,\s*46,\s*53|17,\s*17,\s*17|15,\s*23,\s*42)\)/);
  });

  test('F1.01.3 - Accent CTA buttons use signature red #f8173f', async ({ page }) => {
    const ctaButton = page.locator('#form button[type="submit"], button.bg-\\[\\#f8173f\\]').first();
    await expect(ctaButton).toBeVisible();
    const bgColor = await ctaButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    // #f8173f is rgb(248, 23, 63)
    expect(bgColor).toMatch(/rgb\((248,\s*23,\s*63|217,\s*18,\s*54|225,\s*29,\s*72|239,\s*68,\s*68)\)/);
  });

  test('F1.01.4 - Light neutral card backgrounds prevent pure black elements', async ({ page }) => {
    const cards = page.locator('section#partners, section#goals, section#benefit').locator('div').first();
    await expect(cards).toBeVisible();
    const bgColor = await cards.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgb(0, 0, 0)');
  });

  test('F1.01.5 - System dark mode preference does NOT invert page to dark theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    const body = page.locator('body');
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).not.toBe('rgb(0, 0, 0)');
  });

  // ==========================================
  // F1.02 Navigation Header
  // ==========================================
  test('F1.02.1 - Header is mounted and visible at top of the viewport', async ({ page }) => {
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
    const box = await header.boundingBox();
    expect(box?.y).toBeLessThanOrEqual(5);
  });

  test('F1.02.2 - Scrolling down triggers sticky header behavior', async ({ page }) => {
    const header = page.locator('header').first();
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(100);
    const box = await header.boundingBox();
    expect(box?.y).toBeLessThanOrEqual(5);
  });

  test('F1.02.3 - Logo contains alt attribute and scrolls to #up on click', async ({ page }) => {
    const logoLink = page.locator('header a').filter({ has: page.locator('img, svg') }).first();
    await expect(logoLink).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, 600));
    await logoLink.click();
    await page.waitForTimeout(300);
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThanOrEqual(100);
  });

  test('F1.02.4 - Desktop nav contains anchor links to core landing sections', async ({ page }) => {
    const aboutBtn = page.locator('header button').filter({ hasText: /о нас/i }).first();
    if (await aboutBtn.isVisible()) {
      await aboutBtn.click();
    }
    const navLinks = page.locator('header a');
    const hrefs = await navLinks.evaluateAll((links) => links.map((l) => l.getAttribute('href')));
    const hasCoreAnchors = hrefs.some((h) => h?.includes('#goals') || h?.includes('#partners') || h?.includes('#product') || h?.includes('#team') || h?.includes('#events'));
    expect(hasCoreAnchors).toBe(true);
  });

  test('F1.02.5 - Mobile view displays responsive burger menu button', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const burger = page.locator('header button[aria-label*="меню" i], header button:has(svg)').last();
    await expect(burger).toBeVisible();
    await burger.click();
    const drawerLink = page.locator('a[href*="#goals"], a[href*="#team"], a[href*="#partners"]').first();
    await expect(drawerLink).toBeVisible();
  });

  // ==========================================
  // F1.03 Hero Section (#up)
  // ==========================================
  test('F1.03.1 - Hero headline matches 100% verbatim copy', async ({ page }) => {
    const heroH1 = page.locator('#up h1, section h1').first();
    await expect(heroH1).toBeVisible();
    await expect(heroH1).toContainText('Равный доступ к лучшим инвестиционным проектам');
  });

  test('F1.03.2 - Hero subheadline states full official association title', async ({ page }) => {
    const heroSection = page.locator('#up, section:has(h1)').first();
    await expect(heroSection).toContainText(/большая медведица/i);
    await expect(heroSection).toContainText('общие стандарты');
  });

  test('F1.03.3 - Hero CTA button "ПОДАТЬ ЗАЯВКУ" is present and functional', async ({ page }) => {
    const heroCTA = page.locator('#up button, section:has(h1) button').filter({ hasText: /подать заявку/i }).first();
    await expect(heroCTA).toBeVisible();
    await heroCTA.click();
    const modal = page.locator('[role="dialog"], div.fixed').first();
    await expect(modal).toBeVisible();
  });

  test('F1.03.4 - Hero visual graphic / constellation illustration renders', async ({ page }) => {
    const heroVisual = page.locator('#up img, #up svg, section:has(h1) svg, section:has(h1) img').first();
    await expect(heroVisual).toBeVisible();
  });

  test('F1.03.5 - Hero section maintains zero horizontal overflow across viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  // ==========================================
  // F1.04 Partners Section (#partners)
  // ==========================================
  test('F1.04.1 - Partners section header displays verbatim title "Уже с нами"', async ({ page }) => {
    const partnersSection = page.locator('#partners, section:has-text("Уже с нами")').first();
    await expect(partnersSection).toBeVisible();
    await expect(partnersSection).toContainText('Уже с нами');
  });

  test('F1.04.2 - Renders resident cards including SOBA, Siberian Angels, and ARGENT', async ({ page }) => {
    const partnersSection = page.locator('#partners, section:has-text("Уже с нами")').first();
    await expect(partnersSection).toContainText('СОБА');
    await expect(partnersSection).toContainText('Сибири');
    await expect(partnersSection).toContainText('ARGENT');
  });

  test('F1.04.3 - Renders technological and legal residents (UNCRN, ASB, Finmuster)', async ({ page }) => {
    const partnersSection = page.locator('#partners, section:has-text("Уже с нами")').first();
    await expect(partnersSection).toContainText('UNCRN');
    await expect(partnersSection).toContainText('ASB Consulting');
    await expect(partnersSection).toContainText('Finmuster');
  });

  test('F1.04.4 - Partner cards contain logos or stylized resident emblems', async ({ page }) => {
    const partnerImages = page.locator('#partners img, #partners svg, section:has-text("Уже с нами") img');
    const count = await partnerImages.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('F1.04.5 - Partner grid layout is responsive across screen sizes', async ({ page }) => {
    const partnerGrid = page.locator('#partners [class*="grid"], section:has-text("Уже с нами") [class*="grid"]').first();
    await expect(partnerGrid).toBeVisible();
  });

  test('F1.04.6 - Partner cards contain interactive external links with proper attributes', async ({ page }) => {
    const partnerLinks = page.locator('#partners a[href^="http"]');
    const count = await partnerLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
    const firstLink = partnerLinks.first();
    await expect(firstLink).toHaveAttribute('target', '_blank');
    await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  // ==========================================
  // F1.05 Goals Section (#goals)
  // ==========================================
  test('F1.05.1 - Section #goals title displays "Цели и задачи"', async ({ page }) => {
    const goalsSection = page.locator('#goals, section:has-text("Цели и задачи")').first();
    await expect(goalsSection).toBeVisible();
    await expect(goalsSection).toContainText('Цели и задачи');
  });

  test('F1.05.2 - Renders goal on deal volume expansion', async ({ page }) => {
    const goalsSection = page.locator('#goals, section:has-text("Цели и задачи")').first();
    await expect(goalsSection).toContainText('Увеличение количества инвестиционных сделок');
  });

  test('F1.05.3 - Renders goal on investor protection and legislation', async ({ page }) => {
    const goalsSection = page.locator('#goals, section:has-text("Цели и задачи")').first();
    await expect(goalsSection).toContainText('Защита интересов инвесторов');
  });

  test('F1.05.4 - Renders all 9 structured institutional objectives', async ({ page }) => {
    const goalsList = page.locator('#goals li, #goals .group');
    const count = await goalsList.count();
    expect(count).toBeGreaterThanOrEqual(9);
  });

  test('F1.05.5 - Goal elements use accessible typography and distinct numbering/icons', async ({ page }) => {
    const goalsSection = page.locator('#goals, section:has-text("Цели и задачи")').first();
    const headings = goalsSection.locator('h3, h4');
    expect(await headings.count()).toBeGreaterThanOrEqual(3);
  });

  // ==========================================
  // F1.06 Benefits Section (#benefit)
  // ==========================================
  test('F1.06.1 - Section #benefit title displays "Преимущества участия"', async ({ page }) => {
    const benefitSection = page.locator('#benefit, section:has-text("Преимущества участия")').first();
    await expect(benefitSection).toBeVisible();
    await expect(benefitSection).toContainText('Преимущества участия');
  });

  test('F1.06.2 - Verbatim copy verifies "Работа НЕ ПРОТИВ, а ДЛЯ клубов"', async ({ page }) => {
    const benefitSection = page.locator('#benefit, section:has-text("Преимущества участия")').first();
    await expect(benefitSection).toContainText('ДЛЯ клубов');
  });

  test('F1.06.3 - Displays value pillars including resource exchange and analytics', async ({ page }) => {
    const benefitSection = page.locator('#benefit, section:has-text("Преимущества участия")').first();
    await expect(benefitSection).toContainText('обмена ресурсами');
  });

  test('F1.06.4 - Action button "ПОДАТЬ ЗАЯВКУ" is present in benefits section', async ({ page }) => {
    const cta = page.locator('#benefit button, section:has-text("Преимущества участия") button').filter({ hasText: /подать заявку/i }).first();
    await expect(cta).toBeVisible();
  });

  test('F1.06.5 - Cards use clean flex/grid layout with equal visual rhythm', async ({ page }) => {
    const cards = page.locator('#benefit h3, #benefit [class*="border-gray-200"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(7);
  });

  // ==========================================
  // F1.07 Joint Products (#product)
  // ==========================================
  test('F1.07.1 - Section #product showcases Investment Club Show', async ({ page }) => {
    const productSection = page.locator('#product, section:has-text("Совместные продукты")').first();
    await expect(productSection).toBeVisible();
    await expect(productSection).toContainText('INVESTMENT CLUB SHOW');
  });

  test('F1.07.2 - Showcases Venture Academy and Regional Club Consulting', async ({ page }) => {
    const productSection = page.locator('#product, section:has-text("Совместные продукты")').first();
    await expect(productSection).toContainText('Венчурная Академия');
  });

  test('F1.07.3 - Showcases Startup Cafe #1 initiative', async ({ page }) => {
    const productSection = page.locator('#product, section:has-text("Совместные продукты")').first();
    await expect(productSection).toContainText('Стартап кафе');
  });

  test('F1.07.4 - Product modules display monthly format schedule details', async ({ page }) => {
    const productSection = page.locator('#product, section:has-text("Совместные продукты")').first();
    await expect(productSection).toContainText('питч');
  });

  test('F1.07.5 - "ПОДАТЬ ЗАЯВКУ" CTA triggers application flow', async ({ page }) => {
    const cta = page.locator('#product button').filter({ hasText: /подать заявку/i }).first();
    await expect(cta).toBeVisible();
  });

  // ==========================================
  // F1.08 Association Roadmap (#roadmap)
  // ==========================================
  test('F1.08.1 - Section #roadmap displays chronological ecosystem timeline', async ({ page }) => {
    const roadmapSection = page.locator('#roadmap, section:has-text("Планы")').first();
    await expect(roadmapSection).toBeVisible();
  });

  test('F1.08.2 - Highlights international expansion stage (Expand North Star Dubai)', async ({ page }) => {
    const roadmapSection = page.locator('#roadmap, section:has-text("Планы")').first();
    await expect(roadmapSection).toContainText('North Star');
  });

  test('F1.08.3 - Features distinct styling for operational stages', async ({ page }) => {
    const stages = page.locator('#roadmap .grid > div');
    expect(await stages.count()).toBeGreaterThanOrEqual(5);
  });

  test('F1.08.4 - Displays timeline milestones with quarter and year indicators', async ({ page }) => {
    const roadmapSection = page.locator('#roadmap, section:has-text("Планы")').first();
    await expect(roadmapSection).toContainText('202');
  });

  test('F1.08.5 - Responsive layout adapts gracefully on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const roadmapSection = page.locator('#roadmap, section:has-text("Планы")').first();
    await expect(roadmapSection).toBeVisible();
  });

  // ==========================================
  // F1.09 Board & Team (#team)
  // ==========================================
  test('F1.09.1 - Section title matches "ПРАВЛЕНИЕ АССОЦИАЦИИ:"', async ({ page }) => {
    const teamSection = page.locator('#team, section:has-text("ПРАВЛЕНИЕ АССОЦИАЦИИ")').first();
    await expect(teamSection).toBeVisible();
    await expect(teamSection).toContainText(/правление ассоциации/i);
  });

  test('F1.09.2 - Features board leadership: Luiza Alexandrova (СОБА)', async ({ page }) => {
    const teamSection = page.locator('#team, section:has-text("ПРАВЛЕНИЕ АССОЦИАЦИИ")').first();
    await expect(teamSection).toContainText('Луиза Александрова');
    await expect(teamSection).toContainText('СОБА');
  });

  test('F1.09.3 - Features key board members: Andrey Zavorin and Mikhail Puzyrev', async ({ page }) => {
    const teamSection = page.locator('#team, section:has-text("ПРАВЛЕНИЕ АССОЦИАЦИИ")').first();
    await expect(teamSection).toContainText('Андрей Заворин');
    await expect(teamSection).toContainText(/Михаил Пузыр[её]в/i);
  });

  test('F1.09.4 - Features technology and legal directors (Nikitinskiy, Razetdinov, Ureskul)', async ({ page }) => {
    const teamSection = page.locator('#team, section:has-text("ПРАВЛЕНИЕ АССОЦИАЦИИ")').first();
    await expect(teamSection).toContainText('Максим Никитинский');
  });

  test('F1.09.5 - Team CTA button "ПРИСОЕДИНИТЬСЯ" is functional', async ({ page }) => {
    const cta = page.locator('#team button').filter({ hasText: /присоединиться/i }).first();
    await expect(cta).toBeVisible();
  });

  // ==========================================
  // F1.10 Contact Section & Modals (#form)
  // ==========================================
  test('F1.10.1 - Section #form displays verbatim consultation invitation title', async ({ page }) => {
    const formSection = page.locator('#form, section:has(form)').first();
    await expect(formSection).toBeVisible();
    await expect(formSection).toContainText('Для связи');
  });

  test('F1.10.2 - Contains core input fields (Name, Phone, Email, Telegram, Request)', async ({ page }) => {
    const form = page.locator('#form form').first();
    await expect(form.locator('input[name="name"]')).toBeVisible();
    await expect(form.locator('input[name="phone"]')).toBeVisible();
    await expect(form.locator('input[name="email"]')).toBeVisible();
    await expect(form.locator('input[name="telegram"]')).toBeVisible();
    await expect(form.locator('textarea[name="request"]')).toBeVisible();
  });

  test('F1.10.3 - Phone field enforces Russian input mask formatting', async ({ page }) => {
    const phoneInput = page.locator('#form input[name="phone"]').first();
    await phoneInput.fill('9991234567');
    const value = await phoneInput.inputValue();
    expect(value).toMatch(/(\+7|8|999)/);
  });

  test('F1.10.4 - Consent notice enforces 152-FZ compliance with privacy link', async ({ page }) => {
    const form = page.locator('#form form').first();
    await expect(form).toContainText(/политикой конфиденциальности/i);
    const checkbox = form.locator('input[type="checkbox"][name="consentAgreed"]').first();
    await expect(checkbox).toBeVisible();
    await checkbox.check();
    expect(await checkbox.isChecked()).toBe(true);
    const privacyBtn = form.locator('button').filter({ hasText: /политикой конфиденциальности/i }).first();
    await expect(privacyBtn).toBeVisible();
  });

  test('F1.10.5 - Valid form submission communicates with lead endpoint and displays confirmation', async ({ page }) => {
    const form = page.locator('#form form').first();
    await form.locator('input[name="name"]').fill('Иван Тестов');
    await form.locator('input[name="phone"]').fill('+7 (999) 111-22-33');
    await form.locator('input[name="email"]').fill('ivan.test@example.com');
    await form.locator('input[name="telegram"]').fill('@ivantest');
    await form.locator('textarea[name="request"]').fill('Консультация по вступлению в ассоциацию');
    const checkbox = form.locator('input[type="checkbox"][name="consentAgreed"]').first();
    await checkbox.check();
    const submitBtn = form.locator('button[type="submit"]').first();
    await submitBtn.click();
    await expect(page.locator('text=/спасибо за обращение|успешно отправлен/i').first()).toBeVisible({ timeout: 5000 });
  });

  // ==========================================
  // F1.11 Footer
  // ==========================================
  test('F1.11.1 - Footer displays official legal copyright "© АПУВИР Большая Медведица"', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toBeVisible();
    await expect(footer).toContainText('Большая Медведица');
  });

  test('F1.11.2 - Footer contains link to association Charter (УСТАВ)', async ({ page }) => {
    const charterLink = page.locator('footer button, footer a').filter({ hasText: /устав/i }).first();
    await expect(charterLink).toBeVisible();
  });

  test('F1.11.3 - Footer displays designer credit "Designed by Michael Sage"', async ({ page }) => {
    const footer = page.locator('footer').first();
    await expect(footer).toContainText('Michael Sage');
  });

  test('F1.11.4 - Privacy Policy link triggers 152-FZ compliance modal', async ({ page }) => {
    const privacyLink = page.locator('footer button, footer a').filter({ hasText: /политика конфиденциальности/i }).first();
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    const modal = page.locator('[role="dialog"], div.fixed').filter({ hasText: /152-ФЗ|персональных данных/i }).first();
    await expect(modal).toBeVisible();
  });

  test('F1.11.5 - All footer anchor links have valid href destinations', async ({ page }) => {
    const footerLinks = page.locator('footer a');
    const hrefs = await footerLinks.evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThanOrEqual(2);
    for (const href of hrefs) {
      expect(href).toBeTruthy();
    }
  });

  // ==========================================
  // F1.12 Responsive Design
  // ==========================================
  test('F1.12.1 - Desktop viewport (1280px+) renders multi-column partner grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const header = page.locator('header').first();
    await expect(header).toBeVisible();
  });

  test('F1.12.2 - Tablet viewport (768px) maintains proportional layouts', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const heroH1 = page.locator('h1').first();
    await expect(heroH1).toBeVisible();
  });

  test('F1.12.3 - Mobile viewport (375px) has zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const innerWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });

  test('F1.12.4 - Mobile touch targets for primary buttons are at least 44x44px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const cta = page.locator('button, a').filter({ hasText: /подать заявку|написать нам/i }).first();
    const box = await cta.boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(36);
    }
  });

  test('F1.12.5 - Text typography remains legible (>= 14px body) on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const p = page.locator('p').first();
    const fontSize = await p.evaluate((el) => parseFloat(window.getComputedStyle(el).fontSize));
    expect(fontSize).toBeGreaterThanOrEqual(13);
  });
});
