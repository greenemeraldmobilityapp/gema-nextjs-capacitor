-- ============================================
-- GEMA Database: Clean & Setup Script
-- Jalankan script ini SEKALI di Supabase SQL Editor
-- ============================================

-- ===== 1. CLEANUP: Hapus semua yang ada =====

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON vendor_profiles;
DROP POLICY IF EXISTS "Vendors can update own profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Vendors can insert own profile" ON vendor_profiles;
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
DROP POLICY IF EXISTS "Vendors can insert own services" ON services;
DROP POLICY IF EXISTS "Vendors can update own services" ON services;
DROP POLICY IF EXISTS "Vendors can delete own services" ON services;
DROP POLICY IF EXISTS "Customers can view their orders" ON orders;
DROP POLICY IF EXISTS "Vendors can view their linked orders" ON orders;
DROP POLICY IF EXISTS "Participants can view chats" ON chats;
DROP POLICY IF EXISTS "Participants can view messages" ON messages;
DROP POLICY IF EXISTS "Participants can insert messages" ON messages;
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Customers can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chats CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS vendor_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

-- ===== 2. MIGRATION: Create tables + enums + FK =====

CREATE TYPE "public"."user_role" AS ENUM('customer', 'vendor', 'admin');
CREATE TYPE "public"."order_status" AS ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "public"."payment_status" AS ENUM('unpaid', 'escrow', 'released', 'refunded');

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "role" "user_role" DEFAULT 'customer' NOT NULL,
  "lat" double precision,
  "lng" double precision,
  "is_online" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "vendor_profiles" (
  "user_id" uuid PRIMARY KEY NOT NULL,
  "specialization" text,
  "bio" text,
  "rating" double precision DEFAULT 0,
  "total_jobs" integer DEFAULT 0,
  "is_verified" boolean DEFAULT false,
  "avatar_url" text
);

CREATE TABLE "services" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "vendor_id" uuid NOT NULL,
  "title" text NOT NULL,
  "category" text NOT NULL,
  "price" integer NOT NULL,
  "description" text
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "customer_id" uuid NOT NULL,
  "vendor_id" uuid NOT NULL,
  "service_id" uuid NOT NULL,
  "service_category" text NOT NULL,
  "service_name" text NOT NULL,
  "scheduled_date" date NOT NULL,
  "scheduled_time" text,
  "service_address" text NOT NULL,
  "notes" text,
  "base_amount" integer NOT NULL,
  "platform_fee" integer NOT NULL,
  "vendor_payout" integer NOT NULL,
  "total_amount" integer NOT NULL,
  "payment_status" "payment_status" DEFAULT 'unpaid' NOT NULL,
  "order_status" "order_status" DEFAULT 'pending' NOT NULL,
  "completed_at" timestamp,
  "cancelled_at" timestamp
);

CREATE TABLE "chats" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "chat_id" uuid NOT NULL,
  "sender_id" uuid NOT NULL,
  "message" text,
  "attachment_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "customer_id" uuid NOT NULL,
  "vendor_id" uuid NOT NULL,
  "rating" integer NOT NULL,
  "review_text" text,
  "review_image" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "wallets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" uuid NOT NULL,
  "balance" integer DEFAULT 0 NOT NULL
);

CREATE TABLE "wallet_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "wallet_id" uuid NOT NULL,
  "type" text NOT NULL,
  "amount" integer NOT NULL,
  "status" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "disputes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL,
  "opened_by" uuid NOT NULL,
  "status" text DEFAULT 'open' NOT NULL,
  "resolution" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- ===== 3. FOREIGN KEYS =====

ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "services" ADD CONSTRAINT "services_vendor_id_vendor_profiles_user_id_fk"
  FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("user_id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_users_id_fk"
  FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_vendor_id_vendor_profiles_user_id_fk"
  FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("user_id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "orders" ADD CONSTRAINT "orders_service_id_services_id_fk"
  FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "chats" ADD CONSTRAINT "chats_order_id_orders_id_fk"
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk"
  FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk"
  FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_orders_id_fk"
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_users_id_fk"
  FOREIGN KEY ("customer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_vendor_id_vendor_profiles_user_id_fk"
  FOREIGN KEY ("vendor_id") REFERENCES "public"."vendor_profiles"("user_id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_wallets_id_fk"
  FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_orders_id_fk"
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_users_id_fk"
  FOREIGN KEY ("opened_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

-- ===== 4. ROW LEVEL SECURITY (RLS) =====
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- ===== 5. POLICIES =====

-- Users: self-only access
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Vendor profiles: public read, vendor write
CREATE POLICY "Public profiles are viewable by everyone" ON vendor_profiles
  FOR SELECT USING (true);
CREATE POLICY "Vendors can insert own profile" ON vendor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Vendors can update own profile" ON vendor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Services: public read, vendor CRUD
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);
CREATE POLICY "Vendors can insert own services" ON services
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);
CREATE POLICY "Vendors can update own services" ON services
  FOR UPDATE USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can delete own services" ON services
  FOR DELETE USING (auth.uid() = vendor_id);

-- Orders: customer or vendor only
CREATE POLICY "Customers can view their orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Vendors can view their linked orders" ON orders
  FOR SELECT USING (auth.uid() = vendor_id);

-- Chats: participants only
CREATE POLICY "Participants can view chats" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = chats.order_id
      AND (orders.customer_id = auth.uid() OR orders.vendor_id = auth.uid())
    )
  );

-- Messages: participants can view, sender can insert
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats
      JOIN orders ON chats.order_id = orders.id
      WHERE chats.id = messages.chat_id
      AND (orders.customer_id = auth.uid() OR orders.vendor_id = auth.uid())
    )
  );
CREATE POLICY "Participants can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews: public read, customer insert
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "Customers can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Wallet: owner only
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets
      WHERE wallets.id = wallet_transactions.wallet_id
      AND wallets.user_id = auth.uid()
    )
  );

-- Admin: full access to all tables (via SECURITY DEFINER function to avoid circular subquery)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$;

GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all vendor profiles" ON vendor_profiles
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all vendor profiles" ON vendor_profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can view all wallets" ON wallets
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all wallets" ON wallets
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all wallet transactions" ON wallet_transactions
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all wallet transactions" ON wallet_transactions
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can view all disputes" ON disputes
  FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all disputes" ON disputes
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can manage promos" ON promos
  FOR ALL USING (public.is_admin());

-- ===== 6. TRIGGER: Auto-create user profile on signup =====

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'role'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
