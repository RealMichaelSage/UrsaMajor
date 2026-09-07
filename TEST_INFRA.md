# Test Infrastructure & Strategy: Ursa Major Platform

## 1. Testing Philosophy & Guiding Principles

The Ursa Major platform represents a high-stakes, institutional-grade venture capital association web ecosystem. Reliability, content fidelity, security, and responsive performance are non-negotiable. The test suite is designed under the following foundational principles:

1. **Opaque-Box Requirement-Driven Testing**: Tests treat the application as a black box and evaluate behavior strictly against the authoritative requirements documented in `ORIGINAL_REQUEST.md`, `PROJECT.md`, and `analysis.md`. Assertions are driven by expected business outcomes, user-observable interactions, accessibility contracts, and HTTP/data responses, rather than implementation internals.
2. **Progressive Testability**: Tests are designed to test real features across milestones. Test suites are organized so that early milestone features can be tested immediately, while full integration and end-to-end flows exercise interconnected capabilities without cyclical dependencies.
3. **Strict Integrity & Anti-Cheating**: No dummy/facade implementations, no hardcoded auto-passing mocks, and no tautological assertions. Every assertion tests real logic, real DOM structures, real validation constraints, or genuine contract schemas.
4. **Authoritative Derivation of Expectations**: Every expected value is derived from primary source documents:
   - Visual tokens, copy, and partner/board metadata from `ursa_site_data.json` and `ORIGINAL_REQUEST.md R1`.
   - Event catalog, filters, modal UX, and SEO routes from `PROJECT.md R2`.
   - News feed, categories, and markdown presentation from `PROJECT.md R3`.
   - Ingestion, scraping, Gemini 2.5 Flash normalization, and deduplication logic from `EventsMe` reference architecture and `PROJECT.md R4`.
   - Admin seeds, manual scraping triggers, and moderation state machine from `PROJECT.md R5`.
5. **Deterministic Test Isolation**: Every test creates or configures its required state independently. Network interception and isolated test fixtures allow full suite execution both against live backend services and in reproducible offline CI environments.

---

## 2. Master Feature Inventory & Coverage Matrix (Tiers 1–4)

The test suite provides exhaustive coverage of all 39 discrete features specified in `PROJECT.md`. Tier 1 mandates at least 5 distinct test cases per feature (minimum 195 test cases).

| Feature ID | Feature Name | Requirement Ref | Test File Path | Test Cases Count | Primary Verification Focus |
|---|---|---|---|---|---|
| **F1.01** | Brand Theme & Palette | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | Pure white `#ffffff`, deep slate `#1a2e35`, signature red `#f8173f`, light neutral `#fbfbf9`, WCAG contrast |
| **F1.02** | Navigation Header | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | Sticky navbar, logo link, anchor scroll, mobile burger menu, external links |
| **F1.03** | Hero Section (#up) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | Verbatim headline, subhead, "ПОДАТЬ ЗАЯВКУ" CTA, constellation visual, responsive scaling |
| **F1.04** | Partners Section (#partners) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 12 resident cards (SOBA, Siberian Angels, ARGENT, UNCRN, etc.), authentic logos, grid layout |
| **F1.05** | Goals Section (#goals) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 3 key pillar cards, 9 structured mission objectives, verbatim copy, accessible headings |
| **F1.06** | Benefits Section (#benefit) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 7 strategic participation benefits, 2-column layout, "ПОДАТЬ ЗАЯВКУ" CTA integration |
| **F1.07** | Joint Products (#product) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 5 product cards (Investment Club Show, Venture Academy, Consulting, etc.), monthly schedule |
| **F1.08** | Association Roadmap (#roadmap) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 5-stage timeline, past vs future visual status, Dubai Expand North Star delegation |
| **F1.09** | Board & Team (#team) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 12 board members (Alexandrova, Zavorin, Puzyrev, etc.), photos, credentials, join CTA |
| **F1.10** | Contact Section & Modals (#form) | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | 5-field form, phone mask `+7 (XXX)`, email check, 152-FZ consent checkbox, lead submission |
| **F1.11** | Footer | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | Legal entity details, Charter (Устав), 152-FZ privacy modal, designer credit "Michael Sage" |
| **F1.12** | Responsive Design | R1 | `tests/e2e/tier1-features/r1-landing.spec.ts` | 5 | Desktop 1280px+, Tablet 768px, Mobile 375px, no horizontal scroll, touch targets |
| **F2.01** | PostgreSQL Schema | R4, R5 | `tests/e2e/tier1-features/r2-data-layer.spec.ts` | 5 | Drizzle tables (events, news, seeds, applications, audit_logs), column types, constraints |
| **F2.02** | Seed Data Seeding | R1, R2 | `tests/e2e/tier1-features/r2-data-layer.spec.ts` | 5 | Authentic resident seeds, initial board profiles, default categories, initial migration |
| **F2.03** | Data Access Layer | R2, R4 | `tests/e2e/tier1-features/r2-data-layer.spec.ts` | 5 | Type-safe queries, filtering helpers, connection pooling, indexing performance |
| **F3.01** | Events Showcase (#events) | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | Homepage dynamic cards, "РАЗМЕСТИТЬ МЕРОПРИЯТИЕ" CTA, catalog link, card click modal |
| **F3.02** | Events Catalog Page (/events) | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | Responsive grid, sorting by date ascending, pagination/load more, URL state sync |
| **F3.03** | EventCard Component | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | 16:9 cover, date/time badge, online/offline format pill, price badge, resident attribution |
| **F3.04** | Fast Modal UX | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | Click opens modal, URL updates `/events?event=<id>`, scroll position preserved, ESC closes |
| **F3.05** | SEO Direct Route (/events/[id]) | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | Standalone server page, OpenGraph tags, JSON-LD Schema.org Event, back link to `/events` |
| **F3.06** | Multi-criteria Filtering | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | Filter by format, free/paid, event type, resident, search text with 300ms debounce |
| **F3.07** | Ticket & Source Redirection | R2 | `tests/e2e/tier1-features/r3-events-catalog.spec.ts` | 5 | Outbound ticket link with UTM tracking, `target="_blank"`, source link, safe URL protocols |
| **F4.01** | News Showcase (#news) | R3 | `tests/e2e/tier1-features/r4-news-feed.spec.ts` | 5 | Homepage 3-card market pulse showcase, "Все новости →" link, cover aspect ratios |
| **F4.02** | News Feed Page (/news) | R3 | `tests/e2e/tier1-features/r4-news-feed.spec.ts` | 5 | Dedicated feed page, topic filtering (Analytics, Deals, Regulation), pagination, search |
| **F4.03** | News Detail Route (/news/[id]) | R3 | `tests/e2e/tier1-features/r4-news-feed.spec.ts` | 5 | Full markdown body, author/resident tag, read time badge, share buttons, 404 on missing |
| **F5.01** | Telegram Ingestion Adapter | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | HTTP webview parser for `t.me/s/*`, text extraction, post URLs, CDN media links, rate limits |
| **F5.02** | Website Ingestion Adapter | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | Playwright crawler, script/style noise strip, relative-to-absolute URL, timeout handling |
| **F5.03** | Gemini Structured Normalization | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | Gemini 2.5 Flash schema extraction, Moscow ISO 8601, taxonomy tagging, non-event rejection |
| **F5.04** | Anti-Hallucination Guardrail | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | Strict verbatim check of extracted URLs against raw text, nullifying fabricated links |
| **F5.05** | Date & Category Normalizer | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | Relative Russian dates parsing ("в четверг в 19:00"), UTC+3 offset, venture taxonomy |
| **F5.06** | Trigram Deduplication Engine | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | MD5 exact hash, pg_trgm similarity >= 0.4 on same date, cross-channel duplicate merge |
| **F5.07** | Self-Healing Parser Recalibration | R4 | `tests/e2e/tier1-features/r5-ingestion-engine.spec.ts` | 5 | Autonomous selector recalibration on DOM change, confidence scoring, loop prevention |
| **F6.01** | Admin Dashboard Page (/admin) | R5 | `tests/e2e/tier1-features/r6-admin-moderation.spec.ts` | 5 | Admin layout, session auth check, metrics overview, role authorization guard |
| **F6.02** | Parsing Seeds Management | R5 | `tests/e2e/tier1-features/r6-admin-moderation.spec.ts` | 5 | Seed CRUD (add, toggle active, resident link, category hint, delete, URL validation) |
| **F6.03** | Manual Ingestion Trigger | R5 | `tests/e2e/tier1-features/r6-admin-moderation.spec.ts` | 5 | "Спарсить сейчас" POST trigger, real-time status banner, preview list, error notifications |
| **F6.04** | Event Moderation Queue | R5 | `tests/e2e/tier1-features/r6-admin-moderation.spec.ts` | 5 | Moderation actions: Approve, Pin to Top (`is_top`), Edit metadata, Ban, Deduplication merge |
| **F6.05** | Immediate Cache Invalidation | R5 | `tests/e2e/tier1-features/r6-admin-moderation.spec.ts` | 5 | Instant public visibility on approve/top, tag revalidation, banned event suppression |
| **F7.01** | E2E Test Suite Validation | Acceptance | `tests/e2e/tier1-features/r7-verification-hardening.spec.ts` | 5 | Test runner integrity, deterministic exit codes, cross-browser consistency, zero false positives |
| **F7.02** | Adversarial Hardening | Acceptance | `tests/e2e/tier1-features/r7-verification-hardening.spec.ts` | 5 | SQLi protection, XSS injection sanitization, SSRF protection, payload flood limits |

Total Tier 1 Test Cases: **195** (39 features x 5 tests).

---

## 3. Directory Layout

The test suite is structured within `/Users/michaelsage/Desktop/Vibes/Projects/UrsaMajor/`:

```
tests/
├── e2e/
│   ├── tier1-features/
│   │   ├── r1-landing.spec.ts                   # F1.01 - F1.12 (60 tests)
│   │   ├── r2-data-layer.spec.ts                # F2.01 - F2.03 (15 tests)
│   │   ├── r3-events-catalog.spec.ts            # F3.01 - F3.07 (35 tests)
│   │   ├── r4-news-feed.spec.ts                 # F4.01 - F4.03 (15 tests)
│   │   ├── r5-ingestion-engine.spec.ts          # F5.01 - F5.07 (35 tests)
│   │   ├── r6-admin-moderation.spec.ts          # F6.01 - F6.05 (25 tests)
│   │   └── r7-verification-hardening.spec.ts    # F7.01 - F7.02 (10 tests)
│   ├── tier2-boundary/
│   │   └── boundary-cases.spec.ts               # T2.01 - T2.12 (12 boundary & corner tests)
│   ├── tier3-integration/
│   │   └── cross-feature.spec.ts                # T3.01 - T3.06 (6 end-to-end multi-step flows)
│   └── tier4-scenarios/
│       └── user-journeys.spec.ts                # T4.01 - T4.04 (4 persona real-world scenarios)
├── harness/
│   ├── fixtures.ts                              # Custom Playwright test fixtures & page extensions
│   ├── mock-data.ts                             # Authoritative mock events, news, seeds, and payloads
│   ├── route-interceptor.ts                     # API route interceptor & mock handler for offline runs
│   └── test-utils.ts                            # Date formatters, phone mask helpers, contrast checks
playwright.config.ts                             # Central runner configuration
TEST_INFRA.md                                    # This test infrastructure manual
TEST_READY.md                                    # Certification & execution status
```

---

## 4. Test Harness & Fixtures Architecture

### 4.1 Mock Data & Domain Fidelity
The harness (`tests/harness/mock-data.ts`) provides full fidelity domain models mirroring `src/shared/types/index.ts`:
- **`mockEvents`**: Approved upcoming pitch days, investor breakfasts, demo days, online webinars, free events, and paid events from residents (СОБА, Клуб инвесторов Сибири, ARGENT, Finmuster, etc.).
- **`mockNews`**: Market analytics, VC deals, regulatory insights, and resident updates.
- **`mockSeeds`**: Active and paused Telegram channel sources and website scrapers.
- **`mockTelegramHtml`**: Realistic Telegram public channel markup (`tgme_widget_message_text`, media images, post URLs).
- **`mockGeminiResponses`**: Valid structured event extraction, non-event rejection, and hallucinated URL detection.

### 4.2 Route Interception & Offline Simulation
`tests/harness/route-interceptor.ts` allows tests to intercept `/api/*` endpoints:
- `GET /api/events`: Serves filtered, searched, and paginated event lists.
- `GET /api/events/[id]`: Serves individual event detail.
- `GET /api/news`: Serves filtered news articles.
- `GET /api/news/[id]`: Serves individual article.
- `POST /api/forms/lead`: Validates phone format and consent before returning success.
- `POST /api/admin/ingest/run`: Simulates scraper execution and returns telemetry.
- `POST /api/admin/events`: Simulates moderation actions (`publish`, `top`, `ban`, `edit`, `merge`).
- `POST /api/admin/seeds`: CRUD operations on ingestion sources.

### 4.3 Viewport Emulation
Tests validate responsive fidelity across 3 canonical viewports:
- **Desktop**: 1280x800 and 1920x1080 (full navigation bar, 3-4 card columns).
- **Tablet**: 768x1024 (iPad vertical, 2 card columns).
- **Mobile**: 375x812 (iPhone 14, mobile hamburger drawer, single column cards, touch targets >= 44px).

---

## 5. Execution Protocols & CLI Commands

### 5.1 Running the Test Suites
```bash
# Run all tests across Tiers 1-4 (headless)
npx playwright test

# Run Tier 1 Feature Coverage tests (195 tests)
npx playwright test tests/e2e/tier1-features/

# Run specific Tier 1 groups
npx playwright test tests/e2e/tier1-features/r1-landing.spec.ts
npx playwright test tests/e2e/tier1-features/r2-data-layer.spec.ts
npx playwright test tests/e2e/tier1-features/r3-events-catalog.spec.ts
npx playwright test tests/e2e/tier1-features/r4-news-feed.spec.ts
npx playwright test tests/e2e/tier1-features/r5-ingestion-engine.spec.ts
npx playwright test tests/e2e/tier1-features/r6-admin-moderation.spec.ts
npx playwright test tests/e2e/tier1-features/r7-verification-hardening.spec.ts

# Run Tier 2 Boundary & Corner Cases
npx playwright test tests/e2e/tier2-boundary/boundary-cases.spec.ts

# Run Tier 3 Cross-Feature Integration Flows
npx playwright test tests/e2e/tier3-integration/cross-feature.spec.ts

# Run Tier 4 Real-World Application Persona Scenarios
npx playwright test tests/e2e/tier4-scenarios/user-journeys.spec.ts

# Run tests in headed browser mode with UI debugger
npx playwright test --headed

# Run with trace viewer on failure
npx playwright test --trace on
```

### 5.2 Quality Gates
- **Tier 1 Gate**: 100% of the 195 feature tests must pass without skips or timeouts.
- **Tier 2 Gate**: All boundary and corner cases must be handled without uncaught exceptions, 500 errors, or client crashes.
- **Tier 3 Gate**: All end-to-end state machine workflows must pass with consistent data persistence across routes.
- **Tier 4 Gate**: Persona journeys must achieve complete user flows on both mobile (375px) and desktop (1280px+).
