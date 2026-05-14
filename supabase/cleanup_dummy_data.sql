-- ============================================
-- GEMA: Hapus Data Dummy (Schema Tetap Aman)
-- Jalankan di Supabase SQL Editor
-- ============================================
-- Urutan DELETE berdasarkan foreign key
-- (child table duluan, parent terakhir)
-- ============================================

DELETE FROM fraud_alerts;
DELETE FROM disputes;
DELETE FROM wallet_transactions;
DELETE FROM wallets;
DELETE FROM reviews;
DELETE FROM messages;
DELETE FROM chats;
DELETE FROM orders;
DELETE FROM promos;
DELETE FROM services;
DELETE FROM vendor_profiles;

-- Hapus users yang BUKAN berasal dari Supabase Auth
-- (data dummy di-INSERT langsung, bukan via trigger signup)
DELETE FROM users WHERE id NOT IN (
  SELECT id FROM auth.users
);
