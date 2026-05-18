-- Migration 0014: Review images storage bucket and RLS policies

-- Create the review-images bucket (idempotent)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('review-images', 'review-images', true, false, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Public read: anyone can view review images
DROP POLICY IF EXISTS "Review images public SELECT" ON storage.objects;
CREATE POLICY "Review images public SELECT" ON storage.objects
  FOR SELECT USING (bucket_id = 'review-images');

-- Authenticated users can upload review images
DROP POLICY IF EXISTS "Review images authenticated INSERT" ON storage.objects;
CREATE POLICY "Review images authenticated INSERT" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
  );

-- Users can update own files (for edit)
DROP POLICY IF EXISTS "Review images authenticated UPDATE" ON storage.objects;
CREATE POLICY "Review images authenticated UPDATE" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
  );

-- Users can delete own files
DROP POLICY IF EXISTS "Review images authenticated DELETE" ON storage.objects;
CREATE POLICY "Review images authenticated DELETE" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'review-images'
    AND auth.role() = 'authenticated'
  );
