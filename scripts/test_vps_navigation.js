const { chromium } = require('@playwright/test');

async function testVPS() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('--- TEST 1: Main landing page (https://a-sage.ru/ursa/) ---');
  await page.goto('https://a-sage.ru/ursa/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check title
  const title = await page.title();
  console.log('Page Title:', title);

  // 1. Check navigation link to Events
  const eventsLink = await page.$('nav a[href*="events"]');
  const eventsHref = await eventsLink?.getAttribute('href');
  console.log('Navbar events link href:', eventsHref);

  // Click events link and verify URL
  if (eventsLink) {
    await eventsLink.click();
    await page.waitForTimeout(1000);
    console.log('URL after clicking events link:', page.url());
  }

  console.log('\n--- TEST 2: Events catalog page (https://a-sage.ru/ursa/events/) ---');
  await page.goto('https://a-sage.ru/ursa/events/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Check "Главная" link href
  const homeLink = await page.$('nav a:has-text("Главная")');
  const homeHref = await homeLink?.getAttribute('href');
  console.log('Navbar Главная href:', homeHref);

  // Check Logo link href
  const logoLink = await page.$('a.group:has(svg)');
  const logoHref = await logoLink?.getAttribute('href');
  console.log('Logo link href:', logoHref);

  // Check breadcrumb link
  const breadcrumbHome = await page.$('nav[aria-label="Breadcrumb"] a, div:has-text("ГЛАВНАЯ >") a');
  const breadcrumbHref = await breadcrumbHome?.getAttribute('href');
  console.log('Breadcrumb Главная href:', breadcrumbHref);

  // Test filter buttons
  const onlineFilterBtn = await page.$('button:has-text("Онлайн")');
  if (onlineFilterBtn) {
    await onlineFilterBtn.click();
    await page.waitForTimeout(500);
    console.log('Clicked Онлайн filter. Cards count:', await page.$$eval('article, div.group', el => el.length));
  }

  const allFilterBtn = await page.$('button:has-text("Все")');
  if (allFilterBtn) {
    await allFilterBtn.click();
    await page.waitForTimeout(500);
    console.log('Clicked Все filter. Cards count:', await page.$$eval('article, div.group', el => el.length));
  }

  // Click logo to test return to main page
  if (logoLink) {
    await logoLink.click();
    await page.waitForTimeout(1000);
    console.log('URL after clicking Logo on events page:', page.url());
  }

  await browser.close();
}

testVPS().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
