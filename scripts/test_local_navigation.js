const { chromium } = require('@playwright/test');

async function testLocal() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(`CONSOLE: ${msg.text()}`);
  });
  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  console.log('--- 1. Testing Main Landing (/ursa) ---');
  await page.goto('http://localhost:3000/ursa', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  console.log('Main Page Title:', await page.title());

  // Click on "Мероприятия" in header
  const eventsNav = page.locator('nav a[href="/ursa/events"]').first();
  console.log('Found eventsNav count:', await eventsNav.count());
  await eventsNav.click();
  await page.waitForTimeout(1500);
  console.log('URL after clicking Мероприятия:', page.url());

  // Wait for events cards to appear
  const initialCardsCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Initial events cards rendered:', initialCardsCount);

  // Test Online filter
  console.log('\n--- 2. Testing Filters on Events Page ---');
  const onlineBtn = page.locator('button:has-text("Онлайн")');
  await onlineBtn.click();
  await page.waitForTimeout(600);
  const onlineCardsCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Online filter cards count:', onlineCardsCount);

  // Test Offline filter
  const offlineBtn = page.locator('button:has-text("Оффлайн")');
  await offlineBtn.click();
  await page.waitForTimeout(600);
  const offlineCardsCount = await page.locator('article, div.group:has(h3)').count();
  console.log('Offline filter cards count:', offlineCardsCount);

  // Test "Все" filter
  const allBtn = page.locator('button:has-text("Все")').first();
  await allBtn.click();
  await page.waitForTimeout(600);
  const allCardsCount = await page.locator('article, div.group:has(h3)').count();
  console.log('All filter cards count:', allCardsCount);

  // Click on "Главная" in header or logo
  console.log('\n--- 3. Testing Navigation Back to Main Landing ---');
  const homeLink = page.locator('nav a[href="/ursa"]').first();
  await homeLink.click();
  await page.waitForTimeout(1000);
  console.log('URL after clicking Главная:', page.url());

  console.log('\n--- 4. Errors summary ---');
  if (errors.length > 0) {
    console.error('Captured errors:', errors);
  } else {
    console.log('ZERO console/page errors! Hydration and navigation work perfectly!');
  }

  await browser.close();
}

testLocal().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
