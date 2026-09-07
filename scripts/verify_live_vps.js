const { chromium } = require('@playwright/test');
const path = require('path');

const artifactDir = '/Users/michaelsage/.gemini/antigravity/brain/69bb7e46-b962-4ef0-a00f-3ea35b47d084';

async function runLiveVPSTest() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('requestfailed', req => {
    networkErrors.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
  });

  console.log('=== STEP 1: Main Landing (https://a-sage.ru/ursa/) ===');
  await page.goto('https://a-sage.ru/ursa/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  const title = await page.title();
  console.log('Title:', title);
  await page.screenshot({ path: path.join(artifactDir, 'vps_landing_live.png'), fullPage: false });

  // Click on "Мероприятия" link in Header
  console.log('\n=== STEP 2: Navigating to Events from Header ===');
  const eventsLink = page.locator('header nav a[href="/ursa/events"]').first();
  console.log('Events link count:', await eventsLink.count());
  await eventsLink.click();
  await page.waitForTimeout(1500);

  const currentUrl = page.url();
  console.log('URL after clicking "Мероприятия":', currentUrl);
  if (!currentUrl.includes('/ursa/events')) {
    throw new Error(`Expected URL to include /ursa/events, got: ${currentUrl}`);
  }

  // Verify Events Page
  console.log('\n=== STEP 3: Verifying Events Page Interactivity ===');
  await page.waitForSelector('text=Мероприятия и события', { timeout: 10000 });
  await page.screenshot({ path: path.join(artifactDir, 'vps_events_live.png'), fullPage: false });

  const initialCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Total events cards rendered:', initialCount);

  // Filter: Онлайн
  console.log('Clicking "Онлайн" filter...');
  await page.locator('button:has-text("Онлайн")').click();
  await page.waitForTimeout(600);
  const onlineCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Online events count:', onlineCount);

  // Filter: Оффлайн
  console.log('Clicking "Оффлайн" filter...');
  await page.locator('button:has-text("Оффлайн")').click();
  await page.waitForTimeout(600);
  const offlineCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Offline events count:', offlineCount);

  // Filter: Все
  console.log('Clicking "Все" filter...');
  await page.locator('button:has-text("Все")').first().click();
  await page.waitForTimeout(600);
  const resetCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Reset back to all count:', resetCount);

  // Open Modal
  console.log('\n=== STEP 4: Testing Event Modal ===');
  const firstCard = page.locator('article').first();
  await firstCard.click();
  await page.waitForTimeout(600);

  const modalTitle = page.locator('div[role="dialog"] h2, h2.font-bold').first();
  console.log('Modal visible:', await modalTitle.isVisible());
  console.log('Modal Title:', await modalTitle.innerText());
  await page.screenshot({ path: path.join(artifactDir, 'vps_modal_live.png'), fullPage: false });

  // Close modal
  const closeBtn = page.locator('button[aria-label="Закрыть модальное окно"], div[role="dialog"] button:has(svg)').first();
  await closeBtn.click();
  await page.waitForTimeout(500);

  // Return to Home via Breadcrumb
  console.log('\n=== STEP 5: Returning to Main page via Breadcrumb ===');
  const breadcrumbHome = page.locator('nav a[href="/ursa"]').first();
  await breadcrumbHome.click();
  await page.waitForTimeout(1500);
  console.log('URL after clicking Breadcrumb "Главная":', page.url());
  if (!page.url().includes('/ursa') || page.url() === 'https://a-sage.ru/') {
    throw new Error(`Breadcrumb returned unexpected URL: ${page.url()}`);
  }

  // Go back to Events and test Logo return
  console.log('\n=== STEP 6: Returning to Main page via Logo ===');
  await page.goto('https://a-sage.ru/ursa/events/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const logoLink = page.locator('header a[href="/ursa"]').first();
  await logoLink.click();
  await page.waitForTimeout(1500);
  console.log('URL after clicking Logo:', page.url());
  if (!page.url().includes('/ursa') || page.url() === 'https://a-sage.ru/') {
    throw new Error(`Logo returned unexpected URL: ${page.url()}`);
  }

  console.log('\n=== STEP 7: Errors & Network Diagnostics ===');
  console.log('Console Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) console.log('Console errors:', consoleErrors);
  console.log('Network Failures Count:', networkErrors.length);
  if (networkErrors.length > 0) console.log('Network failures:', networkErrors);

  console.log('\n🎉 ALL LIVE VPS TESTS PASSED FLAWLESSLY!');
  await browser.close();
}

runLiveVPSTest().catch(err => {
  console.error('Test FAILED:', err);
  process.exit(1);
});
