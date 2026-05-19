-- 1. CREATE TABLE service_images
CREATE TABLE IF NOT EXISTS "service_images" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "service_id" uuid NOT NULL REFERENCES "public"."services"("id") ON DELETE CASCADE,
  "image_url" text NOT NULL,
  "sort_order" integer DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_images_service_id ON service_images(service_id);

-- 2. ADD duration_minutes to services
ALTER TABLE services ADD COLUMN IF NOT EXISTS "duration_minutes" integer;

-- 3. MIGRATE existing image_url data to service_images
INSERT INTO service_images (service_id, image_url, sort_order)
SELECT id, image_url, 0 FROM services
WHERE image_url IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM service_images si WHERE si.service_id = services.id
);

-- 4. DROP old image_url column
ALTER TABLE services DROP COLUMN IF EXISTS "image_url";

-- 5. RLS — service_images table
ALTER TABLE service_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "semua bisa lihat gambar layanan"
  ON service_images FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "vendor bisa tambah gambar"
  ON service_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.vendor_id = auth.uid()
    )
  );

CREATE POLICY "vendor bisa update gambar"
  ON service_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.vendor_id = auth.uid()
    )
  );

CREATE POLICY "vendor bisa hapus gambar"
  ON service_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM services
      WHERE services.id = service_id
      AND services.vendor_id = auth.uid()
    )
  );

CREATE POLICY "admin bisa kelola semua gambar"
  ON service_images
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- 6. STORAGE bucket for portfolio-images (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- 7. RLS — storage.objects for portfolio-images
CREATE POLICY "public bisa lihat portfolio images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolio-images');

CREATE POLICY "vendor bisa upload portfolio images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "vendor bisa hapus portfolio images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
