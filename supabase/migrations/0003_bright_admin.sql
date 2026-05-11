-- Phase 8: Admin RLS + Fraud Monitoring Foundation
-- Run this file once in Supabase SQL Editor

-- ===== 1. ADMIN RLS POLICIES =====
-- Helper function: check if current user is admin (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- Users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (public.is_admin());

-- Vendor profiles
CREATE POLICY "Admins can view all vendor profiles" ON vendor_profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all vendor profiles" ON vendor_profiles
  FOR UPDATE USING (public.is_admin());

-- Services
CREATE POLICY "Admins can view all services" ON services
  FOR SELECT USING (public.is_admin());

-- Orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (public.is_admin());

-- Chats
CREATE POLICY "Admins can view all chats" ON chats
  FOR SELECT USING (public.is_admin());

-- Messages
CREATE POLICY "Admins can view all messages" ON messages
  FOR SELECT USING (public.is_admin());

-- Reviews
CREATE POLICY "Admins can view all reviews" ON reviews
  FOR SELECT USING (public.is_admin());

-- Wallets
CREATE POLICY "Admins can view all wallets" ON wallets
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all wallets" ON wallets
  FOR UPDATE USING (public.is_admin());

-- Wallet transactions
CREATE POLICY "Admins can view all wallet transactions" ON wallet_transactions
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all wallet transactions" ON wallet_transactions
  FOR UPDATE USING (public.is_admin());

-- Disputes
CREATE POLICY "Admins can view all disputes" ON disputes
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all disputes" ON disputes
  FOR UPDATE USING (public.is_admin());

-- Promos
CREATE POLICY "Admins can manage promos" ON promos
  FOR ALL USING (public.is_admin());

-- ===== 2. FIX ROLE ESCALATION (CRITICAL) =====
-- Prevent users from changing their own role
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND NEW.role = OLD.role);

-- ===== 3. NEW SCHEMA: fraud_alerts table + role_frozen column =====
CREATE TABLE IF NOT EXISTS "fraud_alerts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" text NOT NULL,
  "severity" text DEFAULT 'medium' NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "affected_user_id" uuid,
  "affected_vendor_id" uuid,
  "related_order_id" uuid,
  "metadata" jsonb,
  "status" text DEFAULT 'open' NOT NULL,
  "resolved_by" uuid,
  "resolution" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "resolved_at" timestamp
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role_frozen" boolean DEFAULT false NOT NULL;

-- Foreign keys for fraud_alerts
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_affected_user_id_users_id_fk"
  FOREIGN KEY ("affected_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_affected_vendor_id_vendor_profiles_user_id_fk"
  FOREIGN KEY ("affected_vendor_id") REFERENCES "public"."vendor_profiles"("user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_related_order_id_orders_id_fk"
  FOREIGN KEY ("related_order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "fraud_alerts" ADD CONSTRAINT "fraud_alerts_resolved_by_users_id_fk"
  FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- Enable RLS on fraud_alerts
ALTER TABLE "fraud_alerts" ENABLE ROW LEVEL SECURITY;

-- Fraud alerts: admin can do everything, vendors/customers can view their own
CREATE POLICY "Admins can manage fraud alerts" ON fraud_alerts
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own fraud alerts" ON fraud_alerts
  FOR SELECT USING (auth.uid() = affected_user_id OR auth.uid() IN (
    SELECT user_id FROM vendor_profiles WHERE user_id = fraud_alerts.affected_vendor_id
  ));
