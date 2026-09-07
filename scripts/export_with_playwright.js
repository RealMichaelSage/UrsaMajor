const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const deployDir = path.join(__dirname, '..', 'deploy_beget', 'ursa-major');

async function exportAll() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  console.log('1. Exporting main landing page...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  let htmlMain = await page.content();
  htmlMain = htmlMain.replace(/"\/_next\//g, '"./_next/');
  htmlMain = htmlMain.replace(/href="\/_next\//g, 'href="./_next/');
  htmlMain = htmlMain.replace(/"\/assets\//g, '"./assets/');
  htmlMain = htmlMain.replace(/href="\/assets\//g, 'href="./assets/');
  htmlMain = htmlMain.replace(/href="\/events"/g, 'href="events/"');
  htmlMain = htmlMain.replace(/href="\/news"/g, 'href="news/"');
  fs.writeFileSync(path.join(deployDir, 'index.html'), htmlMain, 'utf-8');
  console.log('Saved index.html');

  console.log('2. Exporting events page...');
  await page.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  let htmlEvents = await page.content();
  htmlEvents = htmlEvents.replace(/"\/_next\//g, '"../_next/');
  htmlEvents = htmlEvents.replace(/href="\/_next\//g, 'href="../_next/');
  htmlEvents = htmlEvents.replace(/"\/assets\//g, '"../assets/');
  htmlEvents = htmlEvents.replace(/href="\/assets\//g, 'href="../assets/');
  htmlEvents = htmlEvents.replace(/href="\/"/g, 'href="../"');
  htmlEvents = htmlEvents.replace(/href="\/#/g, 'href="../#');
  htmlEvents = htmlEvents.replace(/href="\/events"/g, 'href="./"');
  htmlEvents = htmlEvents.replace(/href="\/news"/g, 'href="../news/"');
  const eventsDir = path.join(deployDir, 'events');
  fs.mkdirSync(eventsDir, { recursive: true });
  fs.writeFileSync(path.join(eventsDir, 'index.html'), htmlEvents, 'utf-8');
  console.log('Saved events/index.html');

  console.log('3. Exporting news page...');
  await page.goto('http://localhost:3000/news', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);
  let htmlNews = await page.content();
  htmlNews = htmlNews.replace(/"\/_next\//g, '"../_next/');
  htmlNews = htmlNews.replace(/href="\/_next\//g, 'href="../_next/');
  htmlNews = htmlNews.replace(/"\/assets\//g, '"../assets/');
  htmlNews = htmlNews.replace(/href="\/assets\//g, 'href="../assets/');
  htmlNews = htmlNews.replace(/href="\/"/g, 'href="../"');
  htmlNews = htmlNews.replace(/href="\/#/g, 'href="../#');
  htmlNews = htmlNews.replace(/href="\/events"/g, 'href="../events/"');
  htmlNews = htmlNews.replace(/href="\/news"/g, 'href="./"');
  const newsDir = path.join(deployDir, 'news');
  fs.mkdirSync(newsDir, { recursive: true });
  fs.writeFileSync(path.join(newsDir, 'index.html'), htmlNews, 'utf-8');
  console.log('Saved news/index.html');

  await browser.close();
  console.log('Export finished successfully!');
}

exportAll().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
