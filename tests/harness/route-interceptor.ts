import { Page, Route } from '@playwright/test';
import {
  mockEvents,
  mockNews,
  mockSeeds,
  mockTelegramHtmlSnippet,
  EventItem,
  NewsArticle,
  ParsingSeed,
} from './mock-data';

export interface RouteInterceptorOptions {
  events?: EventItem[];
  news?: NewsArticle[];
  seeds?: ParsingSeed[];
  latencyMs?: number;
}

/**
 * Sets up route interception on the given Playwright Page so tests can run
 * with deterministic responses or offline without a running backend.
 */
export async function setupApiMocking(page: Page, options: RouteInterceptorOptions = {}) {
  const currentEvents = [...(options.events || mockEvents)];
  const currentNews = [...(options.news || mockNews)];
  const currentSeeds = [...(options.seeds || mockSeeds)];

  // Intercept GET/POST /api/events
  await page.route('**/api/events**', async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'GET') {
      const pathname = url.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const possibleId = parts[parts.length - 1];

      // Check for single event by ID
      if (possibleId && possibleId !== 'events') {
        const found = currentEvents.find((e) => e.id === possibleId);
        if (found && !found.status.includes('rejected')) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, event: found }),
          });
          return;
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, error: 'Мероприятие не найдено' }),
          });
          return;
        }
      }

      // Filtered list
      const format = url.searchParams.get('format');
      const price = url.searchParams.get('price');
      const category = url.searchParams.get('category');
      const resident = url.searchParams.get('resident');
      const search = url.searchParams.get('search')?.toLowerCase();

      let filtered = currentEvents.filter((e) => e.status === 'approved');

      if (format && format !== 'all') {
        if (format === 'online') filtered = filtered.filter((e) => e.isOnline);
        if (format === 'offline') filtered = filtered.filter((e) => !e.isOnline);
      }
      if (price && price !== 'all') {
        if (price === 'free') filtered = filtered.filter((e) => e.priceType === 'free' || e.priceMin === 0);
        if (price === 'paid') filtered = filtered.filter((e) => e.priceType === 'paid' && (e.priceMin ?? 0) > 0);
      }
      if (category && category !== 'all') {
        filtered = filtered.filter((e) => e.category === category);
      }
      if (resident && resident !== 'all') {
        filtered = filtered.filter((e) => e.residentOrganizer?.toLowerCase() === resident.toLowerCase());
      }
      if (search) {
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(search) ||
            e.description.toLowerCase().includes(search) ||
            (e.location && e.location.toLowerCase().includes(search))
        );
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          events: filtered,
          pagination: {
            page: 1,
            limit: 12,
            totalCount: filtered.length,
            totalPages: Math.ceil(filtered.length / 12),
          },
        }),
      });
      return;
    }

    await route.continue();
  });

  // Intercept GET /api/news
  await page.route('**/api/news**', async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();

    if (method === 'GET') {
      const pathname = url.pathname;
      const parts = pathname.split('/').filter(Boolean);
      const possibleIdOrSlug = parts[parts.length - 1];

      if (possibleIdOrSlug && possibleIdOrSlug !== 'news') {
        const found = currentNews.find(
          (n) => n.id === possibleIdOrSlug || n.slug === possibleIdOrSlug
        );
        if (found && found.status === 'published') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, article: found }),
          });
          return;
        } else {
          await route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ success: false, error: 'Статья не найдена' }),
          });
          return;
        }
      }

      const tag = url.searchParams.get('tag');
      let filtered = currentNews.filter((n) => n.status === 'published');
      if (tag && tag !== 'all') {
        filtered = filtered.filter((n) => n.tags.includes(tag));
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          news: filtered,
          pagination: {
            page: 1,
            limit: 10,
            totalCount: filtered.length,
            totalPages: Math.ceil(filtered.length / 10),
          },
        }),
      });
      return;
    }

    await route.continue();
  });

  // Intercept POST /api/forms/lead or /api/contact
  await page.route('**/api/**{forms,contact}**', async (route: Route) => {
    if (route.request().method() === 'POST') {
      let body: any = {};
      try {
        body = JSON.parse(route.request().postData() || '{}');
      } catch {
        // empty
      }

      if (body.consentAgreed === false) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            success: false,
            error: 'Необходимо согласие на обработку персональных данных (152-ФЗ)',
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Заявка успешно принята. Мы свяжемся с вами в течение 24 часов.',
        }),
      });
      return;
    }
    await route.continue();
  });

  // Intercept Admin Moderation & Ingest routes
  await page.route('**/api/admin/events**', async (route: Route) => {
    if (route.request().method() === 'POST') {
      const payload = JSON.parse(route.request().postData() || '{}');
      const { eventId, action, data } = payload;
      const target = currentEvents.find((e) => e.id === eventId);
      if (target) {
        if (action === 'approve') {
          target.status = 'approved';
        } else if (action === 'top') {
          target.isTop = true;
          target.status = 'approved';
        } else if (action === 'ban') {
          target.status = 'rejected';
        } else if (action === 'edit' && data) {
          Object.assign(target, data);
        }
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, action, eventId }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/admin/ingest**', async (route: Route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          jobId: 'job-' + Date.now(),
          message: 'Парсинг успешно завершен',
          scrapedCount: 15,
          eventsCreated: 3,
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/admin/seeds**', async (route: Route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, seeds: currentSeeds }),
      });
      return;
    }
    if (route.request().method() === 'POST') {
      const newSeed = JSON.parse(route.request().postData() || '{}');
      const createdSeed: ParsingSeed = {
        id: 's-' + Date.now(),
        name: newSeed.name || 'Новый источник',
        type: newSeed.type || 'telegram',
        url: newSeed.url,
        residentOrganizer: newSeed.residentOrganizer,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      currentSeeds.push(createdSeed);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, seed: createdSeed }),
      });
      return;
    }
    await route.continue();
  });

  // Intercept Telegram Channel public page requests (t.me/s/*)
  await page.route('https://t.me/s/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/html; charset=utf-8',
      body: mockTelegramHtmlSnippet,
    });
  });
}
