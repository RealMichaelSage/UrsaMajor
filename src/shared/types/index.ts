/**
 * Shared TypeScript Domain Models and Types for Ursa Major Platform
 * Matching PROJECT.md & Milestone 1-6 Specifications
 */

// ==========================================
// Core Domain Enums & Aliases
// ==========================================

export type EventCategory =
  | 'pitch'
  | 'networking'
  | 'conference'
  | 'education'
  | 'analytics'
  | 'other';

export type PriceType = 'free' | 'paid' | 'donation';

export type EventStatus = 'pending' | 'approved' | 'rejected';

export type SeedType = 'telegram' | 'website';

export type ScrapeStatus = 'idle' | 'running' | 'success' | 'failed';

export type NewsStatus = 'draft' | 'published' | 'archived';

export type SubmissionType =
  | 'inline_contact'
  | 'membership_application'
  | 'event_submission';

export type SubmissionStatus = 'new' | 'contacted' | 'resolved';

// ==========================================
// 1. Events Domain Model
// ==========================================

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  rawText?: string | null;
  startAt: string; // ISO-8601 string
  endAt?: string | null; // ISO-8601 string
  timezone: string; // Default 'Europe/Moscow'
  isOnline: boolean;
  location?: string | null;
  venueName?: string | null;
  priceType: PriceType;
  priceMin?: number | null;
  priceMax?: number | null;
  priceCurrency?: string; // Default 'RUB'
  paymentUrl?: string | null;
  sourceUrl: string;
  imageUrl?: string | null;
  category: EventCategory;
  targetAudience: string[]; // e.g. ['business_angels', 'seed_startups', 'funds']
  residentOrganizer?: string | null; // e.g. 'СОБА', 'Синдикат'
  status: EventStatus;
  isTop: boolean;
  mergedIntoId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Parsing Seeds Domain Model
// ==========================================

export interface ParsingSeed {
  id: string;
  name: string;
  type: SeedType;
  url: string;
  residentOrganizer?: string | null;
  isActive: boolean;
  lastScrapedAt?: string | null;
  scrapeStatus?: ScrapeStatus;
  scrapeError?: string | null;
  rules?: Record<string, unknown>;
  createdAt: string;
}

// ==========================================
// 3. News Articles Domain Model
// ==========================================

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  authorOrSource: string;
  publishedAt: string;
  imageUrl?: string | null;
  sourceUrl?: string | null;
  tags: string[];
  status: NewsStatus;
  createdAt: string;
}

// ==========================================
// 4. Application Submissions Domain Model
// ==========================================

export interface ApplicationSubmission {
  id: string;
  type: SubmissionType;
  name: string;
  phone: string;
  email: string;
  telegram?: string | null;
  company?: string | null;
  position?: string | null;
  website?: string | null;
  recommendation?: string | null;
  message?: string | null;
  status: SubmissionStatus;
  createdAt: string;
}

// ==========================================
// 5. Moderator Audit Logs Domain Model
// ==========================================

export interface ModeratorAuditLog {
  id: string;
  eventId?: string | null;
  action: string;
  changedBy: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  timestamp: string;
}

// ==========================================
// 6. Landing Page & Visual Architecture Types (M1)
// ==========================================

export interface ResidentPartner {
  id: string;
  name: string;
  description: string;
  logo: string;
  badge?: string;
  website?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  company?: string;
}

export interface ProductModule {
  id: string;
  name: string;
  badge?: string;
  description: string;
  features: string[];
}

export interface RoadmapPhase {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
}

// ==========================================
// 7. Query & Filter Interfaces
// ==========================================

export interface EventFilters {
  format?: 'all' | 'online' | 'offline';
  price?: 'all' | 'free' | 'paid';
  category?: string;
  resident?: string;
  search?: string;
  date?: 'all' | 'today' | 'weekend' | 'week' | 'month';
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface EventsApiResponse {
  success: boolean;
  events: EventItem[];
  total: number;
  page: number;
  limit: number;
}

export interface NewsApiResponse {
  success: boolean;
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminModerationActionPayload {
  eventId: string;
  action: 'approve' | 'top' | 'ban' | 'edit';
  data?: Partial<EventItem>;
}

export interface IngestionJobResponse {
  success: boolean;
  jobId: string;
  message: string;
}
