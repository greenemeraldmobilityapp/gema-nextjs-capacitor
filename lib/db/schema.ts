import { pgTable, text, timestamp, boolean, uuid, integer, doublePrecision, jsonb, pgEnum } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['customer', 'vendor', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['unpaid', 'escrow', 'released', 'refunded']);

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: userRoleEnum('role').default('customer').notNull(),
  roleFrozen: boolean('role_frozen').default(false).notNull(),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  addressStreet: text('address_street'),
  addressRt: text('address_rt'),
  addressRw: text('address_rw'),
  addressVillage: text('address_village'),
  addressDistrict: text('address_district'),
  addressCity: text('address_city'),
  addressProvince: text('address_province'),
  addressPostalCode: text('address_postal_code'),
  addressFull: text('address_full'),
  isOnline: boolean('is_online').default(false),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  iconName: text('icon_name').default('Wrench').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vendorProfiles = pgTable('vendor_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id),
  categoryId: uuid('category_id').references(() => categories.id),
  specialization: text('specialization'),
  bio: text('bio'),
  rating: doublePrecision('rating').default(0),
  totalJobs: integer('total_jobs').default(0),
  isVerified: boolean('is_verified').default(false),
  verificationStatus: text('verification_status').default('none'),
  rejectionReason: text('rejection_reason'),
  avatarUrl: text('avatar_url'),
  coverageRadius: integer('coverage_radius').default(5),
  operatingHours: jsonb('operating_hours'),
});

export const verificationSubmissions = pgTable('verification_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: text('status').default('pending').notNull(),
  nik: text('nik').notNull(),
  ktpName: text('ktp_name').notNull(),
  ktpUrl: text('ktp_url').notNull(),
  selfieUrl: text('selfie_url'),
  selfieFaceUrl: text('selfie_face_url'),
  certificateUrl: text('certificate_url'),
  certificateName: text('certificate_name'),
  certificateIssuer: text('certificate_issuer'),
  certificateYear: integer('certificate_year'),
  rejectionReason: text('rejection_reason'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
});

export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').references(() => vendorProfiles.userId).notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  price: integer('price').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  status: text('status').default('pending').notNull(),
  durationMinutes: integer('duration_minutes'),
});

export const serviceImages = pgTable('service_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  serviceId: uuid('service_id').references(() => services.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  cancelledAt: timestamp('cancelled_at'),
  invoiceNumber: text('invoice_number'),
});

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id).notNull(),
  senderId: uuid('sender_id').references(() => users.id),
  message: text('message'),
  attachmentUrl: text('attachment_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const vendorOperatingHours = pgTable('vendor_operating_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendorProfiles.userId, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  openTime: text('open_time').notNull(),
  closeTime: text('close_time').notNull(),
  isActive: boolean('is_active').notNull().default(true),
});

export const vendorDateBlocks = pgTable('vendor_date_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendorProfiles.userId, { onDelete: 'cascade' }),
  blockedDate: timestamp('blocked_date', { mode: 'date' }).notNull(),
  reason: text('reason'),
});

export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  customerId: uuid('customer_id').references(() => users.id).notNull(),
  vendorId: uuid('vendor_id').references(() => vendorProfiles.userId).notNull(),
  rating: integer('rating').notNull(),
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
  type: text('type').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').notNull(),
  bankName: text('bank_name'),
  accountNumber: text('account_number'),
  accountHolder: text('account_holder'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const loyaltyTiers = pgTable('loyalty_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  points: integer('points').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const loyaltyRewards = pgTable('loyalty_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  pointsRequired: integer('points_required').notNull(),
  rewardType: text('reward_type').notNull(),
  rewardValue: integer('reward_value').notNull(),
  active: boolean('active').notNull().default(true),
  stock: integer('stock'),
});

export const loyaltyRedemptions = pgTable('loyalty_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rewardId: uuid('reward_id').notNull().references(() => loyaltyRewards.id),
  pointsSpent: integer('points_spent').notNull(),
  status: text('status').notNull().default('used'),
  usedAt: timestamp('used_at').notNull().defaultNow(),
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

export const fraudAlerts = pgTable('fraud_alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(),
  severity: text('severity').default('medium').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  affectedUserId: uuid('affected_user_id').references(() => users.id),
  affectedVendorId: uuid('affected_vendor_id').references(() => vendorProfiles.userId),
  relatedOrderId: uuid('related_order_id').references(() => orders.id),
  metadata: jsonb('metadata'),
  status: text('status').default('open').notNull(),
  resolvedBy: uuid('resolved_by').references(() => users.id),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

export const savedBankAccounts = pgTable('saved_bank_accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  bankCode: text('bank_code').notNull(),
  bankName: text('bank_name').notNull(),
  accountNumber: text('account_number').notNull(),
  accountHolder: text('account_holder').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notificationCategoryEnum = pgEnum('notification_category', ['order', 'chat', 'promo', 'system']);

export const pushTokens = pgTable('push_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  platform: text('platform').notNull().default('web'),
  deviceInfo: jsonb('device_info'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  channel: text('channel').notNull(),
  pushEnabled: boolean('push_enabled').default(true).notNull(),
  emailEnabled: boolean('email_enabled').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  category: notificationCategoryEnum('category').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  icon: text('icon'),
  url: text('url'),
  metadata: jsonb('metadata'),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
});

export const disputes = pgTable('disputes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  openedBy: uuid('opened_by').references(() => users.id).notNull(),
  status: text('status').default('open').notNull(),
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
