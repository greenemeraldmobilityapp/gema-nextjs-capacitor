-- GEMA Supabase Row Level Security (RLS) Policies

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

-- USERS TABLE POLICIES
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Anyone can see basic vendor info (which joins with users)
-- Detailed constraints will be handled in edge functions or views
CREATE POLICY "Public profiles are viewable by everyone" ON vendor_profiles
  FOR SELECT USING (true);

-- VENDOR PROFILES
CREATE POLICY "Vendors can update own profile" ON vendor_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Vendors can insert own profile" ON vendor_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SERVICES
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

CREATE POLICY "Vendors can insert own services" ON services
  FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own services" ON services
  FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete own services" ON services
  FOR DELETE USING (auth.uid() = vendor_id);

-- ORDERS
CREATE POLICY "Customers can view their orders" ON orders
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Vendors can view their linked orders" ON orders
  FOR SELECT USING (auth.uid() = vendor_id);

-- CHATS & MESSAGES
CREATE POLICY "Participants can view chats" ON chats
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = chats.order_id 
      AND (orders.customer_id = auth.uid() OR orders.vendor_id = auth.uid())
    )
  );

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

-- REVIEWS
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Customers can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- WALLETS & TRANSACTIONS
-- Only the owner can view their wallet
CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Only the owner can view their transactions
CREATE POLICY "Users can view own transactions" ON wallet_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM wallets 
      WHERE wallets.id = wallet_transactions.wallet_id 
      AND wallets.user_id = auth.uid()
    )
  );
