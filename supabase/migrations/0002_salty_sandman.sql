CREATE TABLE "promos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"discount" integer NOT NULL,
	"image_url" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE promos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active promos" ON promos
  FOR SELECT USING (active = true);
