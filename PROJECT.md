# Project: Ursa Major Venture Association Web Platform

## Architecture
Full-stack web platform for the Russian Venture Capital & Investment Association "Ursa Major" (ursa-major.ru), replicating 100% of the live site's light-themed design, content, and structure, augmented with an automated real-time event & news aggregation engine with an investment catalog and admin dashboard.

- **Frontend**: Next.js 14+ (App Router), React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), Lucide icons, responsive design (Desktop 1280px+, Tablet 768px, Mobile 375px+).
- **Design Tokens**: Pure White `#ffffff`, Deep Slate / Dark Cyan `#1a2e35`, Signature Red Accent `#f8173f`, Light Neutral `#fbfbf9`, Dark Slate `#111111`, Muted `#858585`.
- **Database & Data Layer**: Supabase PostgreSQL / Drizzle ORM with `pg_trgm` extension for trigram similarity deduplication.
- **AI & Ingestion**: `@google/genai` (Gemini 2.5 Flash) structured output pipeline, public Telegram channel HTTP scraper (`https://t.me/s/<channel>`), Playwright Chromium headless sanitizer for website seeds.
- **Admin Dashboard**: Moderation dashboard at `/admin` (seeds management, manual scraping trigger, event & news moderation with immediate revalidation).

---

## Code Layout
```
/Users/michaelsage/Desktop/Vibes/Projects/UrsaMajor/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                     # Landing page (10 sections + #events + #news)
│   │   │   ├── events/
│   │   │   │   ├── page.tsx                 # Public Events Catalog & Modal UX
│   │   │   │   └── [id]/page.tsx            # Standalone shareable SEO event detail route
│   │   │   ├── news/
│   │   │   │   ├── page.tsx                 # News & Analytics feed page
│   │   │   │   └── [id]/page.tsx            # Standalone news article route
│   │   ├── admin/
│   │   │   ├── page.tsx                     # Admin dashboard (Seeds, Trigger, Moderation)
│   │   │   └── layout.tsx                   # Admin layout
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── ingest/route.ts          # Manual scraping trigger & runner
│   │   │   │   ├── events/route.ts          # Moderation actions (Approve, Top, Ban, Edit)
│   │   │   │   └── seeds/route.ts           # Manage parsing seeds
│   │   │   ├── events/route.ts              # Public events API with filters
│   │   │   ├── news/route.ts                # Public news API
│   │   │   └── contact/route.ts             # Contact & membership application submission
│   │   ├── layout.tsx                       # Root layout (fonts, metadata, header, footer)
│   │   └── globals.css                      # Global styles & Tailwind v4 theme variables
│   ├── components/
│   │   ├── landing/                         # 10 landing sections (Header, Hero, Partners, etc.)
│   │   ├── events/                          # EventCard, EventModal, EventFilters
│   │   ├── news/                            # NewsCard, NewsGrid
│   │   ├── admin/                           # SeedsManager, ModerationQueue, IngestionTrigger
│   │   └── ui/                              # Buttons, Badges, Modals, Inputs
│   ├── shared/
│   │   ├── db/
│   │   │   ├── index.ts                     # Database connection pool & Drizzle instance
│   │   │   └── schema.ts                    # PostgreSQL schema definitions
│   │   ├── lib/
│   │   │   ├── scraper.ts                   # Telegram & Playwright web scraper
│   │   │   ├── gemini.ts                    # Gemini LLM extraction & structured output
│   │   │   ├── deduplication.ts             # Trigram fuzzy matching & merge logic
│   │   │   └── normalizer.ts                # ISO date & category normalization
│   │   └── types/                           # Shared TypeScript interfaces
├── tests/
│   ├── e2e/                                 # Playwright E2E test suites (Tiers 1-4)
│   └── harness/                             # Test harness, fixtures, mock servers
├── public/
│   └── assets/                              # SVGs, partner logos, team photos, emblems
├── package.json
├── tsconfig.json
├── tailwind.config.ts / postcss.config.mjs
└── next.config.ts
```

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | F1.01 Brand Theme & Palette | Light theme tokens: white #ffffff, deep slate #1a2e35, red #f8173f | M1 | R1 |
| 2 | F1.02 Navigation Header | Fixed header with logo SVG, anchor links, contact CTA, mobile burger | M1 | R1 |
| 3 | F1.03 Hero Section (#up) | Eyebrow, H1, subtitle, CTA button, constellation visual | M1 | R1 |
| 4 | F1.04 Partners Section (#partners) | 12 resident cards (SOBA, Syndicate, etc.) with badges & links | M1 | R1 |
| 5 | F1.05 Goals Section (#goals) | 3 key pillar cards with 9 structured mission objectives | M1 | R1 |
| 6 | F1.06 Benefits Section (#benefit) | 2-column layout with 7 strategic participation benefits & CTA | M1 | R1 |
| 7 | F1.07 Joint Products (#product) | 5 product cards (Investment Club Show, Academy, Consulting, etc.) | M1 | R1 |
| 8 | F1.08 Association Roadmap (#roadmap) | 5-stage timeline of strategic ecosystem development | M1 | R1 |
| 9 | F1.09 Board & Team (#team) | 12 board member cards with photos, roles, companies, join CTA | M1 | R1 |
| 10 | F1.10 Contact Section & Modals (#form) | Inline 5-field form, 9-field membership modal, 152-FZ privacy modal | M1 | R1 |
| 11 | F1.11 Footer | Legal entity details, Ustav link, copyright, designer credit | M1 | R1 |
| 12 | F1.12 Responsive Design | Fluid layout across Desktop (1280px+), Tablet (768px), Mobile (375px+) | M1 | R1 |
| 13 | F2.01 PostgreSQL Schema | Drizzle tables: events, seeds, news, applications, audit_logs | M2 | R4, R5 |
| 14 | F2.02 Seed Data Seeding | Initial migrations & authentic seed data (residents, board, samples) | M2 | R1, R2 |
| 15 | F2.03 Data Access Layer | Type-safe DB query helpers, connection pooling, indexing | M2 | R2, R4 |
| 16 | F3.01 Events Showcase (#events) | Homepage interactive showcase with featured event cards | M3 | R2 |
| 17 | F3.02 Events Catalog Page (/events) | Dedicated catalog page with pagination and responsive grid | M3 | R2 |
| 18 | F3.03 EventCard Component | 16:10 poster, dates, online/offline, price badge, resident attribution | M3 | R2 |
| 19 | F3.04 Fast Modal UX | Detail popup on card click preserving scroll position and active filters | M3 | R2 |
| 20 | F3.05 SEO Direct Route (/events/[id]) | Standalone shareable detail page with OpenGraph metadata | M3 | R2 |
| 21 | F3.06 Multi-criteria Filtering | Filter by date range, format, free/paid, event type, resident | M3 | R2 |
| 22 | F3.07 Ticket & Source Redirection | Verified direct payment/ticket links and original source URL | M3 | R2 |
| 23 | F4.01 News Showcase (#news) | Homepage dynamic news & market pulse feed module | M4 | R3 |
| 24 | F4.02 News Feed Page (/news) | Dedicated news catalog with filters by tag, date, and source | M4 | R3 |
| 25 | F4.03 News Detail Route (/news/[id]) | Standalone news article view with full content & attribution | M4 | R3 |
| 26 | F5.01 Telegram Ingestion Adapter | HTTP webview parser for public Telegram channels (zero API key) | M5 | R4 |
| 27 | F5.02 Website Ingestion Adapter | Playwright headless crawler with DOM noise sanitizer | M5 | R4 |
| 28 | F5.03 Gemini Structured Normalization | Gemini 2.5 Flash batch extraction into structured JSON schema | M5 | R4 |
| 29 | F5.04 Anti-Hallucination Guardrail | Literal in-text URL verification to eliminate fabricated links | M5 | R4 |
| 30 | F5.05 Date & Category Normalizer | Strict ISO 8601 Moscow timestamps and venture taxonomy tagging | M5 | R4 |
| 31 | F5.06 Trigram Deduplication Engine | pg_trgm similarity matching & media inheritance across sources | M5 | R4 |
| 32 | F5.07 Self-Healing Parser Recalibration | Autonomous CSS selector recovery on markup changes | M5 | R4 |
| 33 | F6.01 Admin Dashboard Page (/admin) | Administrative dashboard layout, metrics overview, active seeds | M6 | R5 |
| 34 | F6.02 Parsing Seeds Management | Add, edit, toggle, delete Telegram and website ingestion sources | M6 | R5 |
| 35 | F6.03 Manual Ingestion Trigger | "Спарсить сейчас" button triggering real-time background parsing | M6 | R5 |
| 36 | F6.04 Event Moderation Queue | Approve, Pin to Top, Edit, Ban actions with audit trail | M6 | R5 |
| 37 | F6.05 Immediate Cache Invalidation | Instant visibility updates on public /events and /news upon moderation | M6 | R5 |
| 38 | F7.01 E2E Test Suite Validation | 100% pass of requirement-driven E2E tests (Tiers 1-4) | M7 | Acceptance |
| 39 | F7.02 Adversarial Hardening | Tier 5 adversarial stress testing & edge-case coverage | M7 | Acceptance |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Independent 4-tier test runner, fixtures, and Tiers 1-4 test suites | none | DONE |
| M1 | Core & Landing Page 1:1 | Next.js 14+ App Router, Tailwind v4 theme, 10 original landing sections | none | DONE |
| M2 | Database & Data Layer | Supabase PostgreSQL schema, Drizzle ORM, migrations, seed records | none | DONE |
| M3 | Events Catalog & Modal UX | /events catalog, filters, EventCard, modal popup, /events/[id] SEO | M1, M2 | IN_PROGRESS |
| M4 | News & Media Feed | /news feed, homepage #news block, /news/[id] article view | M1, M2 | IN_PROGRESS |
| M5 | Ingestion & Gemini AI Engine | Telegram/Web scrapers, Gemini 2.5 Flash normalization, deduplication | M2 | IN_PROGRESS |
| M6 | Admin Panel & Moderation | /admin dashboard, seed management, "Спарсить сейчас", moderation queue | M2, M3, M5 | PLANNED |
| M7 | E2E Acceptance & Hardening | Pass 100% E2E test suite (Tiers 1-4) + Tier 5 adversarial hardening | E2E, M1-M6 | PLANNED |

---

## Interface Contracts

### 1. Database & Domain Models (`src/shared/types/index.ts`)
```typescript
export interface EventItem {
  id: string;
  title: string;
  description: string;
  rawText?: string;
  startAt: string; // ISO-8601
  endAt?: string;   // ISO-8601
  timezone: string; // Default Europe/Moscow
  isOnline: boolean;
  location?: string;
  venueName?: string;
  priceType: 'free' | 'paid' | 'donation';
  priceMin?: number;
  priceMax?: number;
  priceCurrency: string; // Default RUB
  paymentUrl?: string;
  sourceUrl: string;
  imageUrl?: string;
  category: 'pitch' | 'networking' | 'conference' | 'education' | 'analytics' | 'other';
  targetAudience: string[]; // e.g. ['business_angels', 'seed_startups', 'funds']
  residentOrganizer?: string; // e.g. 'СОБА', 'Синдикат'
  status: 'pending' | 'approved' | 'rejected';
  isTop: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParsingSeed {
  id: string;
  name: string;
  type: 'telegram' | 'website';
  url: string;
  residentOrganizer?: string;
  isActive: boolean;
  lastScrapedAt?: string;
  scrapeStatus?: 'idle' | 'running' | 'success' | 'failed';
  scrapeError?: string;
  rules?: Record<string, string>;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  authorOrSource: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}
```

### 2. Moderation & Ingestion API Contracts
- `POST /api/admin/ingest`: Trigger manual scraping run. Returns `{ success: true, jobId: string, message: string }`.
- `POST /api/admin/events`: Update event status. Body: `{ eventId: string, action: 'approve' | 'top' | 'ban' | 'edit', data?: Partial<EventItem> }`. Revalidates `events` cache tag immediately.
- `GET /api/events`: Query events with filters: `?format=online&price=free&resident=SOBA&from=...&to=...`.
