-- Migration 0008: RLS Policies, accepted_at/started_at, handle_new_user trigger

-- ===== 1. ENABLE RLS ON ALL TABLES =====
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

-- ===== 2. USERS POLICIES =====
DROP POLICY IF EXISTS "Users can insert own row" ON users;
CREATE POLICY "Users can insert own row" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- already have: "Users can update own data" (with role_frozen check)
-- already have: "Admins can view all users"
-- already have: "Admins can update all users"

-- ===== 3. VENDOR_PROFILES POLICIES =====
DROP POLICY IF EXISTS "Anyone can view vendor profiles" ON vendor_profiles;
CREATE POLICY "Anyone can view vendor profiles" ON vendor_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can insert own profile" ON vendor_profiles;
CREATE POLICY "Vendors can insert own profile" ON vendor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vendors can update own profile" ON vendor_profiles;
CREATE POLICY "Vendors can update own profile" ON vendor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== 4. SERVICES POLICIES =====
DROP POLICY IF EXISTS "Anyone can view services" ON services;
CREATE POLICY "Anyone can view services" ON services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Vendors can insert own services" ON services;
CREATE POLICY "Vendors can insert own services" ON services
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can update own services" ON services;
CREATE POLICY "Vendors can update own services" ON services
  FOR UPDATE USING (auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Vendors can delete own services" ON services;
CREATE POLICY "Vendors can delete own services" ON services
  FOR DELETE USING (auth.uid() = vendor_id);

-- ===== 5. ORDERS POLICIES =====
DROP POLICY IF EXISTS "Customers can insert orders" ON orders;
CREATE POLICY "Customers can insert orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = vendor_id);

DROP POLICY IF EXISTS "Customers can cancel own orders" ON orders;
CREATE POLICY "Customers can cancel own orders" ON orders
  FOR UPDATE USING (auth.uid() = customer_id AND order_status = 'pending');

DROP POLICY IF EXISTS "Vendors can update assigned orders" ON orders;
CREATE POLICY "Vendors can update assigned orders" ON orders
  FOR UPDATE USING (auth.uid() = vendor_id);

-- ===== 6. CHATS POLICIES =====
DROP POLICY IF EXISTS "Participants can insert chats" ON chats;
CREATE POLICY "Participants can insert chats" ON chats
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT customer_id FROM orders WHERE id = order_id
      UNION
      SELECT vendor_id FROM orders WHERE id = order_id
    )
  );

DROP POLICY IF EXISTS "Participants can view chats" ON chats;
CREATE POLICY "Participants can view chats" ON chats
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM orders WHERE id = order_id
      UNION
      SELECT vendor_id FROM orders WHERE id = order_id
    )
  );

-- ===== 7. MESSAGES POLICIES =====
DROP POLICY IF EXISTS "Chat participants can insert messages" ON messages;
CREATE POLICY "Chat participants can insert messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (
      SELECT o.customer_id FROM chats c
      JOIN orders o ON o.id = c.order_id
      WHERE c.id = chat_id
      UNION
      SELECT o.vendor_id FROM chats c
      JOIN orders o ON o.id = c.order_id
      WHERE c.id = chat_id
    )
  );

DROP POLICY IF EXISTS "Chat participants can view messages" ON messages;
CREATE POLICY "Chat participants can view messages" ON messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT o.customer_id FROM chats c
      JOIN orders o ON o.id = c.order_id
      WHERE c.id = chat_id
      UNION
      SELECT o.vendor_id FROM chats c
      JOIN orders o ON o.id = c.order_id
      WHERE c.id = chat_id
    )
  );

-- ===== 8. REVIEWS POLICIES =====
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Customers can insert own reviews" ON reviews;
CREATE POLICY "Customers can insert own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update own reviews" ON reviews;
CREATE POLICY "Customers can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = customer_id);

-- ===== 9. WALLETS POLICIES =====
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Wallet INSERT and UPDATE handled by service_role (Edge Functions / triggers only)

-- ===== 10. WALLET_TRANSACTIONS POLICIES =====
DROP POLICY IF EXISTS "Users can view own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can view own wallet transactions" ON wallet_transactions
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM wallets WHERE id = wallet_id
    )
  );

-- Wallet transaction INSERT handled by service_role

-- ===== 11. DISPUTES POLICIES =====
DROP POLICY IF EXISTS "Users can insert disputes for own orders" ON disputes;
CREATE POLICY "Users can insert disputes for own orders" ON disputes
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT customer_id FROM orders WHERE id = order_id
      UNION
      SELECT vendor_id FROM orders WHERE id = order_id
    )
  );

DROP POLICY IF EXISTS "Users can view own disputes" ON disputes;
CREATE POLICY "Users can view own disputes" ON disputes
  FOR SELECT USING (
    auth.uid() IN (
      SELECT customer_id FROM orders WHERE id = order_id
      UNION
      SELECT vendor_id FROM orders WHERE id = order_id
    )
  );

-- ===== 12. ADD accepted_at AND started_at TO orders =====
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at timestamp;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS started_at timestamp;

-- ===== 13. HANDLE_NEW_USER TRIGGER =====
-- Auto-create users row when a new auth user signs up (covers Google OAuth edge case)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== 14. AUTO-CREATE WALLET ON USER INSERT =====
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.wallets (id, user_id, balance)
  VALUES (gen_random_uuid(), NEW.id, 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_created_wallet ON public.users;
CREATE TRIGGER on_user_created_wallet
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_wallet();

-- ===== 15. ATOMIC WALLET CREDIT FUNCTION =====
-- Used by release-payment edge function to avoid race conditions
CREATE OR REPLACE FUNCTION public.credit_wallet(p_wallet_id uuid, p_amount integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  new_balance integer;
BEGIN
  UPDATE public.wallets
  SET balance = balance + p_amount
  WHERE id = p_wallet_id
  RETURNING balance INTO new_balance;
  RETURN new_balance;
END;
$$;

-- ===== 16. GRANT USAGE ON SCHEMA FOR TRIGGERS =====
-- The handle_new_user trigger needs to be owned by a superuser or have proper grants
-- Run as superuser if available, otherwise run separately:
-- GRANT USAGE ON SCHEMA public TO postgres, service_role;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
