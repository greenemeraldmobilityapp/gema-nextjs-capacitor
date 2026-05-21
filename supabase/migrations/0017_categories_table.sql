CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"icon_name" text DEFAULT 'Wrench' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "vendor_profiles" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
--> Seed initial 8 categories
INSERT INTO "categories" ("slug", "name", "icon_name") VALUES
  ('tukang-bangunan', 'Tukang Bangunan', 'Wrench'),
  ('teknisi-listrik', 'Teknisi Listrik', 'Zap'),
  ('plumbing', 'Plumbing', 'Droplets'),
  ('cat-interior', 'Cat & Interior', 'Paintbrush'),
  ('ac-kulkas', 'AC & Kulkas', 'Thermometer'),
  ('elektronik', 'Elektronik', 'Cable'),
  ('furniture', 'Furniture', 'Hammer'),
  ('pest-control', 'Pest Control', 'Bug')
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
--> Migrate existing vendor_profiles.specialization to category_id
UPDATE vendor_profiles v
SET category_id = c.id
FROM categories c
WHERE v.specialization IS NOT NULL
  AND v.specialization = c.name;--> statement-breakpoint
--> Migrate existing services.category to category_id
UPDATE services s
SET category_id = c.id
FROM categories c
WHERE s.category = c.slug;--> statement-breakpoint
--> Enable RLS
ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
--> RLS: everyone can read active categories
CREATE POLICY "categories_select_all" ON "categories" FOR SELECT USING (true);--> statement-breakpoint
--> RLS: only admins can manage categories
CREATE POLICY "categories_insert_admin" ON "categories" FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);--> statement-breakpoint
CREATE POLICY "categories_update_admin" ON "categories" FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);--> statement-breakpoint
CREATE POLICY "categories_delete_admin" ON "categories" FOR DELETE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);