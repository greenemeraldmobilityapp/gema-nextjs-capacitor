// Database schema definitions for Drizzle ORM
import { 
  pgTable, 
  uuid, 
  text, 
  timestamp, 
  doublePrecision, 
  boolean,
  integer,
  date,
  time
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(), // In Supabase, this will link to auth.users
  full_name: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: text('role').notNull(), // 'customer', 'vendor', 'admin'
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  is_online: boolean('is_online').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const vendor_profiles = pgTable('vendor_profiles', {
  user_id: uuid('user_id').primaryKey().references(() => users.id),
  specialization: text('specialization'),
  bio: text('bio'),
  rating: doublePrecision('rating').default(0),
  total_jobs: integer('total_jobs').default(0),
  is_verified: boolean('is_verified').default(false),
  avatar_url: text('avatar_url'),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendor_id: uuid('vendor_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  price: doublePrecision('price').notNull(),
  description: text('description'),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customer_id: uuid('customer_id').references(() => users.id).notNull(),
  vendor_id: uuid('vendor_id').references(() => users.id).notNull(),
  service_id: uuid('service_id').references(() => services.id).notNull(),
  service_category: text('service_category').notNull(),
  service_name: text('service_name').notNull(),
  scheduled_date: date('scheduled_date').notNull(),
  scheduled_time: time('scheduled_time').notNull(),
  service_address: text('service_address').notNull(),
  notes: text('notes'),
  base_amount: doublePrecision('base_amount').notNull(),
  platform_fee: doublePrecision('platform_fee').notNull(),
  vendor_payout: doublePrecision('vendor_payout').notNull(),
  total_amount: doublePrecision('total_amount').notNull(),
  payment_status: text('payment_status').default('pending').notNull(),
  escrow_status: text('escrow_status').default('held').notNull(),
  order_status: text('order_status').default('pending').notNull(),
  completed_at: timestamp('completed_at'),
  cancelled_at: timestamp('cancelled_at'),
});

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => orders.id).notNull(),
  sender_id: uuid('sender_id').references(() => users.id).notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chat_id: uuid('chat_id').references(() => chats.id).notNull(),
  sender_id: uuid('sender_id').references(() => users.id).notNull(),
  message: text('message'),
  attachment_url: text('attachment_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => orders.id).notNull(),
  customer_id: uuid('customer_id').references(() => users.id).notNull(),
  vendor_id: uuid('vendor_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(),
  review_text: text('review_text'),
  review_image: text('review_image'),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => users.id).notNull(),
  balance: doublePrecision('balance').default(0).notNull(),
});

export const wallet_transactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  wallet_id: uuid('wallet_id').references(() => wallets.id).notNull(),
  type: text('type').notNull(),
  amount: doublePrecision('amount').notNull(),
  status: text('status').default('pending').notNull(),
});

export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => orders.id).notNull(),
  opened_by: uuid('opened_by').references(() => users.id).notNull(),
  status: text('status').default('open').notNull(),
  resolution: text('resolution'),
});
