const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const deployDir = path.join(rootDir, 'deploy_vps', 'ursa');

const { DEFAULT_EVENTS } = require(path.join(rootDir, 'src', 'components', 'events', 'utils.ts'));
const { DEFAULT_NEWS } = require(path.join(rootDir, 'src', 'components', 'news', 'data.ts'));

const eventsPayload = JSON.stringify({
  success: true,
  events: DEFAULT_EVENTS,
  total: DEFAULT_EVENTS.length,
  pagination: { page: 1, limit: 12, totalCount: DEFAULT_EVENTS.length, totalPages: 1 }
});

const newsPayload = JSON.stringify({
  success: true,
  news: DEFAULT_NEWS,
  total: DEFAULT_NEWS.length
});

const apiEventsDir = path.join(deployDir, 'api', 'events');
fs.mkdirSync(apiEventsDir, { recursive: true });
fs.writeFileSync(path.join(deployDir, 'api', 'events.json'), eventsPayload, 'utf-8');
fs.writeFileSync(path.join(apiEventsDir, 'index.html'), eventsPayload, 'utf-8');

const apiNewsDir = path.join(deployDir, 'api', 'news');
fs.mkdirSync(apiNewsDir, { recursive: true });
fs.writeFileSync(path.join(deployDir, 'api', 'news.json'), newsPayload, 'utf-8');
fs.writeFileSync(path.join(apiNewsDir, 'index.html'), newsPayload, 'utf-8');

console.log('✓ Created static fallback JSON payloads for /api/events and /api/news');
