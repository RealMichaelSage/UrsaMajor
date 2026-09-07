const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const deployDir = path.join(rootDir, 'deploy_vps', 'ursa');

// Clean deploy directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true, force: true });
}
fs.mkdirSync(deployDir, { recursive: true });

// 1. Copy .next/static to deploy_vps/ursa/_next/static
const nextStaticSrc = path.join(rootDir, '.next', 'static');
const nextStaticDst = path.join(deployDir, '_next', 'static');
fs.cpSync(nextStaticSrc, nextStaticDst, { recursive: true });
console.log('✓ Copied .next/static -> _next/static');

// 2. Copy public/* to deploy_vps/ursa/*
const publicSrc = path.join(rootDir, 'public');
fs.cpSync(publicSrc, deployDir, { recursive: true });
console.log('✓ Copied public assets -> deploy_vps/ursa/');

// Helper to copy HTML to both [name].html and [name]/index.html
function copyPageHtml(srcPath, dstName) {
  if (!fs.existsSync(srcPath)) {
    console.warn('Warning: Source file not found:', srcPath);
    return;
  }
  const content = fs.readFileSync(srcPath, 'utf-8');

  // As [name].html
  fs.writeFileSync(path.join(deployDir, `${dstName}.html`), content, 'utf-8');

  // As [name]/index.html
  const folderPath = path.join(deployDir, dstName);
  fs.mkdirSync(folderPath, { recursive: true });
  fs.writeFileSync(path.join(folderPath, 'index.html'), content, 'utf-8');
}

// 3. Main Landing page
const indexHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'index.html');
fs.copyFileSync(indexHtmlSrc, path.join(deployDir, 'index.html'));
console.log('✓ Copied index.html');

// 4. Events Catalog page
const eventsHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'events.html');
copyPageHtml(eventsHtmlSrc, 'events');
console.log('✓ Copied events.html and events/index.html');

// 5. News Catalog page
const newsHtmlSrc = path.join(rootDir, '.next', 'server', 'app', 'news.html');
copyPageHtml(newsHtmlSrc, 'news');
console.log('✓ Copied news.html and news/index.html');

// 6. Event Detail pages
const eventsDir = path.join(rootDir, '.next', 'server', 'app', 'events');
if (fs.existsSync(eventsDir)) {
  const files = fs.readdirSync(eventsDir);
  for (const file of files) {
    if (file.endsWith('.html') && file !== 'index.html') {
      const id = file.replace('.html', '');
      const content = fs.readFileSync(path.join(eventsDir, file), 'utf-8');
      
      // Save in events/[id].html and events/[id]/index.html
      fs.writeFileSync(path.join(deployDir, 'events', `${id}.html`), content, 'utf-8');
      const itemFolder = path.join(deployDir, 'events', id);
      fs.mkdirSync(itemFolder, { recursive: true });
      fs.writeFileSync(path.join(itemFolder, 'index.html'), content, 'utf-8');
    }
  }
  console.log('✓ Copied individual event detail pages');
}

// 7. News Detail pages
const newsDir = path.join(rootDir, '.next', 'server', 'app', 'news');
if (fs.existsSync(newsDir)) {
  const files = fs.readdirSync(newsDir);
  for (const file of files) {
    if (file.endsWith('.html') && file !== 'index.html') {
      const id = file.replace('.html', '');
      const content = fs.readFileSync(path.join(newsDir, file), 'utf-8');
      
      // Save in news/[id].html and news/[id]/index.html
      fs.writeFileSync(path.join(deployDir, 'news', `${id}.html`), content, 'utf-8');
      const itemFolder = path.join(deployDir, 'news', id);
      fs.mkdirSync(itemFolder, { recursive: true });
      fs.writeFileSync(path.join(itemFolder, 'index.html'), content, 'utf-8');
    }
  }
  console.log('✓ Copied individual news detail pages');
}

console.log('\nBundle preparation for VPS complete!');
