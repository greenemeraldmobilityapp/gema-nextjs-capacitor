import { pgTable, text, timestamp, boolean, uuid, integer, doublePrecision, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'vendor', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'escrow', 'released', 'refunded']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // Using Supabase auth.users ID
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoleEnum('role').default('customer').notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  isOnline: boolean('is_online').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vendorProfiles = pgTable('vendor_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  specialization: text('specialization'),
  bio: text('bio'),
  rating: doublePrecision('rating').default(0),
  totalJobs: integer('total_jobs').default(0),
  isVerified: boolean('is_verified').default(false),
  avatarUrl: text('avatar_url'),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendorProfiles.userId).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  price: integer('price').notNull(),
  description: text('description'),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  vendorId: uuid('vendor_id').references(() => vendorProfiles.userId).notNull(),
  serviceId: uuid('service_id').references(() => services.id).notNull(),
  serviceCategory: text('service_category').notNull(),
  serviceName: text('service_name').notNull(),
  scheduledDate: timestamp('scheduled_date', { mode: 'date' }).notNull(),
  scheduledTime: text('scheduled_time'),
  serviceAddress: text('service_address').notNull(),
  notes: text('notes'),
  baseAmount: integer('base_amount').notNull(),
  platformFee: integer('platform_fee').notNull(),
  vendorPayout: integer('vendor_payout').notNull(),
  totalAmount: integer('total_amount').notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),
  orderStatus: orderStatusEnum('order_status').default('pending').notNull(),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
});

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  senderId: uuid('sender_id').references(() => users.id).notNull(),
  message: text('message'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  vendorId: uuid('vendor_id').references(() => vendorProfiles.userId).notNull(),
  rating: integer('rating').notNull(), // 1 to 5
  reviewText: text('review_text'),
  reviewImage: text('review_image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const wallets = pgTable('wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  balance: integer('balance').default(0).notNull(),
});

export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').references(() => wallets.id).notNull(),
  type: text('type').notNull(), // 'topup', 'withdrawal', 'payment', 'escrow_release'
  amount: integer('amount').notNull(),
  status: text('status').notNull(), // 'pending', 'success', 'failed'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promos = pgTable('promos', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  discount: integer('discount').notNull(),
  imageUrl: text('image_url'),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  openedBy: uuid('opened_by').references(() => users.id).notNull(),
  status: text('status').default('open').notNull(), // 'open', 'resolved'
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
