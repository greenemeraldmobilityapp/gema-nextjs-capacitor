-- Phase 8: Admin RLS Policies
-- Uses SECURITY DEFINER function to avoid circular subquery issues

-- Helper function: check if current user is admin (bypasses RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin');
$$;

-- Grant execute to authenticated users
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
