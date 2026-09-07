CREATE TABLE "application_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(50) DEFAULT 'inline_contact' NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"telegram" varchar(100),
	"company" varchar(255),
	"position" varchar(255),
	"website" text,
	"recommendation" text,
	"message" text,
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"raw_text" text,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone,
	"timezone" varchar(50) DEFAULT 'Europe/Moscow' NOT NULL,
	"is_online" boolean DEFAULT false NOT NULL,
	"location" varchar(255),
	"venue_name" varchar(255),
	"price_type" varchar(20) DEFAULT 'free' NOT NULL,
	"price_min" integer DEFAULT 0,
	"price_max" integer,
	"price_currency" varchar(10) DEFAULT 'RUB' NOT NULL,
	"payment_url" text,
	"source_url" text NOT NULL,
	"image_url" text,
	"category" varchar(50) DEFAULT 'other' NOT NULL,
	"target_audience" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"resident_organizer" varchar(255),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"is_top" boolean DEFAULT false NOT NULL,
	"merged_into_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moderator_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid,
	"action" varchar(50) NOT NULL,
	"changed_by" varchar(255) NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"summary" text NOT NULL,
	"content" text NOT NULL,
	"author_or_source" varchar(255) DEFAULT 'Пресс-служба АПУВИР' NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"image_url" text,
	"source_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "parsing_seeds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"url" text NOT NULL,
	"resident_organizer" varchar(255),
	"is_active" boolean DEFAULT true NOT NULL,
	"last_scraped_at" timestamp with time zone,
	"scrape_status" varchar(30) DEFAULT 'idle',
	"scrape_error" text,
	"rules" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "parsing_seeds_url_unique" UNIQUE("url")
);
--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_merged_into_id_events_id_fk" FOREIGN KEY ("merged_into_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moderator_audit_logs" ADD CONSTRAINT "moderator_audit_logs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_submissions_status_idx" ON "application_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_submissions_type_idx" ON "application_submissions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "app_submissions_created_at_idx" ON "application_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_start_at_idx" ON "events" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_is_top_idx" ON "events" USING btree ("is_top");--> statement-breakpoint
CREATE INDEX "events_category_idx" ON "events" USING btree ("category");--> statement-breakpoint
CREATE INDEX "events_resident_idx" ON "events" USING btree ("resident_organizer");--> statement-breakpoint
CREATE INDEX "events_is_online_idx" ON "events" USING btree ("is_online");--> statement-breakpoint
CREATE INDEX "events_price_type_idx" ON "events" USING btree ("price_type");--> statement-breakpoint
CREATE INDEX "events_merged_into_id_idx" ON "events" USING btree ("merged_into_id");--> statement-breakpoint
CREATE INDEX "audit_logs_event_id_idx" ON "moderator_audit_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "audit_logs_timestamp_idx" ON "moderator_audit_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "news_articles_published_at_idx" ON "news_articles" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "news_articles_status_idx" ON "news_articles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "news_articles_slug_idx" ON "news_articles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "parsing_seeds_is_active_idx" ON "parsing_seeds" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "parsing_seeds_type_idx" ON "parsing_seeds" USING btree ("type");