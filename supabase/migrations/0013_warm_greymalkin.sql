CREATE TABLE "vendor_date_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"blocked_date" timestamp NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "vendor_operating_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" text NOT NULL,
	"close_time" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "sender_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_date_blocks" ADD CONSTRAINT "vendor_date_blocks_vendor_id_vendor_profiles_user_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_operating_hours" ADD CONSTRAINT "vendor_operating_hours_vendor_id_vendor_profiles_user_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("user_id") ON DELETE cascade ON UPDATE no action;