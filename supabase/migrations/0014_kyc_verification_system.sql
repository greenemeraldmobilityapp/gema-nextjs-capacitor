-- KYC Verification System
-- 0014: verification_submissions table + vendor_profiles columns + storage RLS

-- Create the verification bucket if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES ('verification', 'verification', true)
ON CONFLICT (id) DO NOTHING;

-- Create verification_submissions table
CREATE TABLE IF NOT EXISTS verification_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  nik TEXT NOT NULL,
  ktp_name TEXT NOT NULL,
  ktp_url TEXT NOT NULL,
  certificate_url TEXT,
  certificate_name TEXT,
  certificate_issuer TEXT,
  certificate_year INTEGER,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id)
);

-- Index for latest submission per vendor
CREATE INDEX IF NOT EXISTS idx_verification_submissions_user
  ON verification_submissions(user_id, submitted_at DESC);

-- Add columns to vendor_profiles
ALTER TABLE vendor_profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'none'
    CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected'));

ALTER TABLE vendor_profiles
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Enable RLS
ALTER TABLE verification_submissions ENABLE ROW LEVEL SECURITY;

-- RLS: vendors can read own submissions
DROP POLICY IF EXISTS "vendors_select_own_submissions" ON verification_submissions;
CREATE POLICY "vendors_select_own_submissions"
  ON verification_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- RLS: vendors can insert own submissions
DROP POLICY IF EXISTS "vendors_insert_own_submissions" ON verification_submissions;
CREATE POLICY "vendors_insert_own_submissions"
  ON verification_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: vendors can update own pending submissions
DROP POLICY IF EXISTS "vendors_update_own_pending" ON verification_submissions;
CREATE POLICY "vendors_update_own_pending"
  ON verification_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- RLS: admins can read all submissions
DROP POLICY IF EXISTS "admins_select_all_submissions" ON verification_submissions;
CREATE POLICY "admins_select_all_submissions"
  ON verification_submissions FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- RLS: admins can update any submission
DROP POLICY IF EXISTS "admins_update_all_submissions" ON verification_submissions;
CREATE POLICY "admins_update_all_submissions"
  ON verification_submissions FOR UPDATE
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Storage RLS for verification bucket
DROP POLICY IF EXISTS "vendor_select_own_verification_files" ON storage.objects;
CREATE POLICY "vendor_select_own_verification_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vendor_insert_verification_files" ON storage.objects;
CREATE POLICY "vendor_insert_verification_files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'verification'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vendor_update_own_verification_files" ON storage.objects;
CREATE POLICY "vendor_update_own_verification_files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'verification'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "vendor_delete_own_verification_files" ON storage.objects;
CREATE POLICY "vendor_delete_own_verification_files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'verification'
    AND auth.role() = 'authenticated'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "admin_select_all_verification_files" ON storage.objects;
CREATE POLICY "admin_select_all_verification_files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'verification'
    AND auth.role() = 'authenticated'
    AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );
