# Original User Request

## 2026-09-07T10:39:24Z

Full-stack web platform for the Russian Venture Capital & Investment Association "Ursa Major" (ursa-major.ru) replicating 100% of the live site's light-themed design, content, and structure, augmented with an automated real-time event & news aggregation engine with an investment catalog and admin dashboard.

Working directory: /Users/michaelsage/Desktop/Vibes/Projects/UrsaMajor
Integrity mode: development

Reference materials:
- Live site: https://ursa-major.ru
- Reference project (parser, AI extraction, EventCard UX): /Users/michaelsage/Desktop/Vibes/EventsMe
- Scraped dataset of all texts, sections, and images: /Users/michaelsage/.gemini/antigravity/brain/69bb7e46-b962-4ef0-a00f-3ea35b47d084/scratch/ursa_site_data.json

## Requirements

### R1. Exact Light-Themed Replication of ursa-major.ru
Recreate the complete landing page in a clean light theme matching the live site (white `#ffffff`, deep slate `#1a2e35`, signature red `#f8173f`). All original text content, logos, SVG graphics, partner cards (SOBA, Syndicate, etc.), board members (Alexandrova, Zavorin, etc.), goals, benefits, roadmap, and contact forms must be preserved 1:1 from the extracted site dataset.

### R2. Dynamic Investment Events Catalog & Modal UX (/events & #events)
Transform the `#events` section into a live showcase and add a full `/events` catalog page. Feature EventCards with event poster, dates, online/offline format, price badge, target audience tags (e.g. business angels, seed startups), association resident attribution, direct ticket/payment purchase link, and source link. Detail view must support fast modal popup on the listing as well as direct shareable SEO URLs (`/events/[id]`). Include filters for dates, format, free/paid, event type, and resident organizer.

### R3. Market News & Analytics Media Feed (/news & #news)
Add a dynamic market pulse module displaying news, analytical digests, and updates from association members, with a showcase block on the homepage and a dedicated `/news` feed page.

### R4. Real-time Ingestion & AI Normalization Engine
Port and adapt the self-healing scraper and Gemini LLM extraction pipeline from `/Users/michaelsage/Desktop/Vibes/EventsMe`. The engine must collect unstructured posts and articles from Telegram channels and resident websites, extract structured JSON schema (title, datetime, location, pricing, payment URL, target audience, tags), and store normalized records in Supabase PostgreSQL.

### R5. Association Admin Panel (/admin)
Provide an internal administrative dashboard to manage ingestion sources (Telegram channels and websites tagged by member), trigger manual real-time parsing runs ("Спарсить сейчас"), and moderate collected events (Approve, Pin to Top, Edit, Ban).

## Acceptance Criteria

### Visual & Content Fidelity
- [ ] All 10 original landing page sections (`#up`, `#partners`, `#goals`, `#benefit`, `#product`, `#roadmap`, `#team`, `#form`, header, footer) match the live `ursa-major.ru` copy and asset structure in pure light theme.
- [ ] Responsive design functions seamlessly across desktop (1280px+), tablet (768px), and mobile (375px+).

### Catalog & UX Functionality
- [ ] `/events` page displays interactive cards with functioning filters (format, date, price, resident, type).
- [ ] Clicking an event card opens the details modal without losing scroll position or active filters.
- [ ] Direct navigation to `/events/[id]` renders the event page with proper metadata.
- [ ] Event payment links and original source links redirect correctly.

### Ingestion & Admin
- [ ] Scraper engine successfully executes and extracts test events into PostgreSQL schema using Gemini structured output.
- [ ] `/admin` dashboard allows adding a new source and manually triggering an ingestion cycle.
- [ ] Moderation actions (Approve, Top, Ban) immediately update event visibility on public pages.
- [ ] Build compiles cleanly (`next build` succeeds without TypeScript or lint errors).
