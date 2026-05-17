ALTER TABLE "orders" ADD COLUMN "accepted_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "started_at" timestamp;--> statement-breakpoint
ALTER TABLE "vendor_profiles" ADD COLUMN "coverage_radius" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "vendor_profiles" ADD COLUMN "operating_hours" jsonb;