# Anti-Disintermediation Plan — GEMA

> Mencegah customer & vendor meninggalkan platform
> Disusun: 2026-05-27 | Berdasarkan brainstorming dengan founder

---

## Problem Statement

Customer dan vendor memiliki potensi untuk meninggalkan aplikasi GEMA setelah bertemu langsung dan saling tukar nomor kontak. Transaksi selanjutnya terjadi di luar platform, menyebabkan:

- **GEMA kehilangan revenue** (platform fee 15%)
- **Customer kehilangan proteksi escrow**
- **Vendor kehilangan tools manajemen & reputasi digital**
- **Platform tidak memiliki data transaksi** untuk analisa & improvement

**Disintermediation** adalah masalah klasik semua marketplace (Gojek, Tokopedia, Upwork). Solusinya bukan memaksa pengguna bertahan, tapi **menciptakan value di dalam platform yang tidak bisa didapatkan di luar**.

---

## Strategi Utama

GEMA memiliki **1 moat kuat (escrow)** yang sudah berjalan. Masalahnya customer & vendor belum sadar value escrow itu sendiri.

| Strategi | Deskripsi |
|----------|-----------|
| **Edukasi escrow** | Jadikan escrow sebagai value proposition yang terlihat di setiap touchpoint |
| **Chat lebih berguna dari WA** | Integrasi dengan order progress, image sharing, template pesan |
| **Vendor dependency** | Tools scheduling, invoice, laporan pajak, earnings analytics |
| **Repeat booking frictionless** | Satu klik rebook ke vendor yang sama |
| **Gentle enforcement** | Deteksi + edukasi saat pola kontak terdeteksi, bukan blokir paksa |
| **Loyalty rewards** | Poin yang bisa ditukar diskon/voucher/topup — hangus jika transaksi di luar |

---

## 7 Prioritas Implementasi

Prioritas diurutkan berdasarkan **Effort vs Impact**:

| # | Prioritas | Effort | Impact | Kategori |
|---|-----------|--------|--------|----------|
| 🥇 | 1. Escrow Messaging Prominent | Rendah (1 hari) | Tinggi | UI/Copy |
| 🥇 | 2. One-Click Rebook | Rendah (1 hari) | Tinggi | Frontend |
| 🥈 | 3. Chat Quality Improvement | Sedang (2-3 hari) | Tinggi | Frontend + Storage |
| 🥈 | 4. Vendor Schedule Management | Besar (3-4 hari) | Tinggi | DB + Frontend |
| 🥉 | 5. Loyalty Points System | Besar (3-4 hari) | Sedang | DB + Frontend + Trigger |
| 🥉 | 6. Chat Pattern Detection | Rendah (1 hari) | Sedang | Frontend |
| 🥉 | 7. Auto-Invoice + Tax Report | Sedang (2-3 hari) | Tinggi | DB + Frontend |

**Total estimasi:** ~14-18 hari kerja

---

### 🥇 1. Escrow Messaging Prominent

**Tujuan:** Customer & vendor selalu sadar bahwa transaksi dilindungi escrow.

**Tidak perlu migration DB.** Hanya perubahan UI/copy.

#### File yang Diubah

| File | Perubahan |
|------|-----------|
| `app/customer/chat/detail/page.tsx` | Tambah banner escrow di atas area chat. Muncul jika `payment_status === 'escrow'` |
| `app/vendor/chat/detail/page.tsx` | Tambah banner escrow serupa untuk vendor |
| `app/customer/orders/detail/page.tsx` | Tambah section escrow protection di header dengan ikon `ShieldCheck` |
| `app/customer/orders/page.tsx` | Tambah badge "Dilindungi Escrow" di samping status |
| `app/customer/payment/success/page.tsx` | Perkuat copy escrow — tambah step visual progress |

#### Desain Card Escrow

```
┌──────────────────────────────────────┐
│ 🛡️ Dilindungi Escrow GEMA            │
│                                      │
│ Dana Anda Rp 250.000 aman ditahan    │
│ sampai pekerjaan selesai & Anda puas │
│                                      │
│ [Detail Pesanan]                     │
└──────────────────────────────────────┘
```

- Background: `bg-blue-50/80 border border-blue-200`
- Ikon: `ShieldCheck` dari lucide-react
- Link: arahkan ke halaman detail pesanan

#### Escrow Status Badge di List Order

- Untuk order dengan `payment_status === 'escrow'`
- Badge kecil: `text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5`
- Teks: "Dilindungi Escrow"

#### Step Visual di Payment Success

Tampilkan flowchart progress:

```
[1] 💰 Dana ditahan ✓  →  [2] 🔧 Pekerjaan berjalan  →  [3] ✅ Dana dilepas
```

Step 1 aktif (emerald) saat `payment_status === 'escrow'`. Step 3 aktif saat `'released'`.

---

### 🥇 2. One-Click Rebook

**Tujuan:** Customer bisa repeat order ke vendor yang sama dalam 1 klik.

**Tidak perlu migration DB.** Booking flow sudah ada.

#### File yang Diubah

| File | Perubahan |
|------|-----------|
| `app/customer/orders/detail/page.tsx` | Tambah tombol "🔁 Pesan Lagi" saat `order_status === 'completed'`. Navigasi ke `/customer/booking?vendor_id=X&service_id=Y` |
| `app/customer/booking/page.tsx` | Jika URL params `vendor_id` + `service_id` ada, pre-fill semua data — langsung ke step konfirmasi |
| `app/customer/orders/page.tsx` | Tambah ikon `RotateCcw` di card order completed — tooltip: "Pesan Lagi" |

#### Flow

```
[Completed Order] → klik "Pesan Lagi"
  → /customer/booking?vendor_id=X&service_id=Y
  → Form pre-filled: vendor, service, alamat (dari profil terbaru)
  → Customer pilih tanggal + catatan
  → Klik "Pesan" → checkout normal
```

#### Detail Implementasi Booking Pre-fill

`app/customer/booking/page.tsx`:

1. Baca `vendor_id` dan `service_id` dari `useSearchParams`
2. Jika ada, **skip step pemilihan vendor/service** — langsung render form konfirmasi
3. Tampilkan header: "Pesan Lagi — [Nama Vendor]"
4. Tampilkan riwayat order sebelumnya: "Sebelumnya Anda memesan [service] pada [tanggal]"
5. Pre-fill `scheduled_date` dengan hari ini + 1 (default)
6. Pre-fill `service_address` dari profil customer terbaru

#### Tombol "Pesan Lagi"

```tsx
// Di halaman detail order, setelah order selesai
{order.order_status === 'completed' && (
  <button
    onClick={() => router.push(`/customer/booking?vendor_id=${order.vendor_id}&service_id=${order.service_id}`)}
    className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center gap-2"
  >
    <RotateCcw className="w-5 h-5" />
    Pesan Lagi
  </button>
)}
```

---

### 🥈 3. Chat Quality Improvement

**Tujuan:** Chat GEMA lebih berguna dari WhatsApp untuk konteks order.

**Tidak perlu migration DB** — `attachment_url` sudah ada di `messages` table.
**Tapi perlu:** Storage bucket baru untuk chat images + RLS policy.

#### 3.1 Image Sharing

##### Persiapan Storage

Buat bucket `chat-images` di Supabase Storage:
- Public read (siapa pun bisa lihat gambar)
- Insert hanya authenticated user
- Max file: 10 MB per image
- Format: jpg, png, webp

##### File yang Diubah

| File | Perubahan |
|------|-----------|
| `lib/services/useChat.ts` | Tambah `useSendImage()` mutation: upload file ke storage → insert message dengan `attachment_url` |
| `app/customer/chat/detail/page.tsx` | Aktifkan tombol Paperclip (yang sudah ada tapi non-functional). Upload gambar. Render gambar sebagai thumbnail. Klik → lightbox |
| `app/vendor/chat/detail/page.tsx` | Sama — upload + render gambar |

##### Hook: `useSendImage`

```typescript
export function useSendImage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ chatId, senderId, file }: {
      chatId: string
      senderId: string
      file: File
    }) => {
      // 1. Upload to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${chatId}/${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file)
      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName)

      // 3. Insert message with attachment_url
      const { error } = await supabase.from('messages').insert({
        chat_id: chatId,
        sender_id: senderId,
        attachment_url: publicUrl,
        message: null,
      })
      if (error) throw error
    },
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', chatId] })
    },
  })
}
```

##### UI Gambar di Chat

```tsx
// Di render message
{msg.attachment_url && (
  <img
    src={msg.attachment_url}
    alt="Gambar"
    className="max-w-[200px] rounded-xl cursor-pointer"
    onClick={() => setPreviewImage(msg.attachment_url)}
  />
)}
```

Gunakan `ImageLightbox.tsx` yang sudah ada untuk preview.

#### 3.2 System Messages

**Tujuan:** Setiap perubahan status order otomatis terposting ke chat sebagai system message.

##### Implementasi

| File | Perubahan |
|------|-----------|
| `lib/services/useChat.ts` | Tambah fungsi `postSystemMessage(chatId, message, icon)` — insert message dengan `sender_id: null` |
| `app/customer/orders/detail/page.tsx` | Setelah mutation accept/start/complete success, panggil `postSystemMessage()` |
| `app/vendor/orders/detail/page.tsx` | Setelah mutation vendor accept/start/complete, panggil `postSystemMessage()` |
| `app/customer/chat/detail/page.tsx` | Render system message dengan style berbeda |
| `app/vendor/chat/detail/page.tsx` | Sama |

##### System Message Events

| Event | Icon | Pesan |
|-------|------|-------|
| Order dibuat | 📋 | "Pesanan berhasil dibuat. Menunggu [Vendor]." |
| Vendor accept | ✅ | "[Vendor] telah menerima pesanan Anda." |
| Vendor start | 🔧 | "Pekerjaan sedang dimulai." |
| Order selesai | ✅ | "Pekerjaan selesai! Jangan lupa konfirmasi." |
| Escrow released | 💰 | "Pembayaran telah dilepaskan ke [Vendor]." |
| Order cancelled | ❌ | "Pesanan telah dibatalkan." |

##### Style System Message

```tsx
// Deteksi system message: sender_id === null
{!msg.sender_id ? (
  <div className="text-center py-2 my-2">
    <span className="text-xs text-gray-400 italic">
      {msg.message}
    </span>
  </div>
) : (
  // render normal message
)}
```

#### 3.3 Template Pesan untuk Vendor

##### File yang Diubah

`app/vendor/chat/detail/page.tsx` — tambah row chip template di atas input chat.

##### Template Chips

```tsx
const templates = [
  "Sedang dalam perjalanan",
  "Sampai di lokasi",
  "Pekerjaan selesai",
  "Butuh tambahan biaya",
]

// Render di atas input
<div className="flex gap-2 overflow-x-auto px-4 py-2">
  {templates.map((t) => (
    <button
      key={t}
      onClick={() => setInput(t)}
      className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 whitespace-nowrap"
    >
      {t}
    </button>
  ))}
</div>
```

Klik chip → text masuk ke input (bisa diedit dulu sebelum kirim).

---

### 🥈 4. Vendor Schedule Management

**Tujuan:** Vendor manage ketersediaan → customer hanya bisa booking di jam aktif.

**Perlu migration DB:** 2 table baru.

#### Schema Baru

```typescript
// lib/db/schema.ts

export const vendorOperatingHours = pgTable('vendor_operating_hours', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendorProfiles.userId, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Minggu, 1=Senin, ... 6=Sabtu
  openTime: text('open_time').notNull(),        // "08:00"
  closeTime: text('close_time').notNull(),       // "17:00"
  isActive: boolean('is_active').notNull().default(true),
})

export const vendorDateBlocks = pgTable('vendor_date_blocks', {
  id: uuid('id').primaryKey().defaultRandom(),
  vendorId: uuid('vendor_id').notNull().references(() => vendorProfiles.userId, { onDelete: 'cascade' }),
  blockedDate: timestamp('blocked_date').notNull(),
  reason: text('reason'),
})
```

#### File yang Diubah/Dibuat

| File | Perubahan |
|------|-----------|
| `lib/db/schema.ts` | Tambah 2 table di atas |
| Migration baru | `npx drizzle-kit generate` → apply via Supabase |
| **Baru:** `app/vendor/settings/schedule/page.tsx` | Halaman manajemen jadwal lengkap |
| `app/vendor/profile/edit/page.tsx` | Tambah toggle Online/Offline prominent |
| `app/vendor/dashboard/page.tsx` | Tampilkan status online/offline + toggle cepat |
| `app/customer/booking/page.tsx` | Validasi jam operasional sebelum booking |
| `app/customer/vendor/page.tsx` | Tampilkan jam operasional vendor |
| `lib/services/useVendors.ts` | Tambah hooks schedule |

#### Halaman Schedule Vendor

Halaman baru di `app/vendor/settings/schedule/page.tsx`:

**Layout:**
```
┌─────────────────────────────────────────┐
│ ⚡ Status Online                         │
│ [🟢 Online — Menerima Pesanan]         │
│                                          │
│ ⏰ Jam Operasional                       │
│ ┌─────────────────────────────────┐      │
│ │ Senin     🟢 08:00 ─ 17:00  ✏️  │      │
│ │ Selasa    🟢 08:00 ─ 17:00  ✏️  │      │
│ │ Rabu      🔴 Libur           ✏️  │      │
│ │ Kamis     🟢 08:00 ─ 17:00  ✏️  │      │
│ │ Jumat     🟢 08:00 ─ 16:30  ✏️  │      │
│ │ Sabtu     🟢 09:00 ─ 14:00  ✏️  │      │
│ │ Minggu    🔴 Libur           ✏️  │      │
│ └─────────────────────────────────┘      │
│                                          │
│ 📅 Tanggal Libur                         │
│ ┌─────────────────────────────────┐      │
│ │ 15 Jun 2026 — Acara keluarga  🗑️  │      │
│ │ 20 Jun 2026 — Cuti            🗑️  │      │
│ │                                     │      │
│ │ [+ Tambah Tanggal Libur]           │      │
│ └─────────────────────────────────┘      │
│                                          │
│ [Simpan]                                 │
└─────────────────────────────────────────┘
```

#### Toggle Online/Offline di Vendor Profile

Di `app/vendor/profile/edit/page.tsx`:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-xl">
  <div>
    <p className="font-medium">Status Online</p>
    <p className="text-sm text-gray-500">
      {isOnline ? "Menerima pesanan baru" : "Tidak menerima pesanan"}
    </p>
  </div>
  <button
    onClick={toggleOnlineStatus}
    className={`relative h-8 w-16 rounded-full transition-colors ${
      isOnline ? 'bg-emerald-500' : 'bg-gray-300'
    }`}
  >
    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
      isOnline ? 'translate-x-9' : 'translate-x-1'
    }`} />
  </button>
</div>
```

Update `vendor_profiles` → set `is_online`.

#### Validasi Booking Customer

Di `app/customer/booking/page.tsx`:

1. Fetch jam operasional vendor
2. Cek apakah `scheduled_date` termasuk blocked
3. Cek apakah hari dan jam booking sesuai jam operasional
4. Jika tidak tersedia: tampilkan error message + rekomendasi jadwal alternatif

```typescript
const { data: hours } = useVendorOperatingHours(vendorId)
const { data: blockedDates } = useVendorDateBlocks(vendorId)
const isVendorOnline = vendor?.vendor_profiles?.is_online

// Validasi
const dayOfWeek = new Date(selectedDate).getDay()
const todayHours = hours?.find(h => h.dayOfWeek === dayOfWeek)
const isBlocked = blockedDates?.some(
  b => new Date(b.blockedDate).toDateString() === new Date(selectedDate).toDateString()
)

if (!isVendorOnline) {
  // Tampilkan: "Vendor sedang offline. Vendor akan menerima pesanan saat online kembali."
}
if (isBlocked) {
  // Tampilkan: "Vendor tidak tersedia pada tanggal ini."
}
if (todayHours && !todayHours.isActive) {
  // Tampilkan: "Vendor libur pada hari [nama hari]."
}
```

---

### 🥉 5. Loyalty Points System

**Tujuan:** Customer dapat poin tiap transaksi → poin bisa ditukar diskon/voucher/topup wallet.

**Perlu migration DB:** 3 table baru + trigger.

#### Schema Baru

```typescript
export const loyaltyTiers = pgTable('loyalty_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  points: integer('points').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const loyaltyRewards = pgTable('loyalty_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  pointsRequired: integer('points_required').notNull(),
  rewardType: text('reward_type').notNull(), // 'discount' | 'topup' | 'voucher'
  rewardValue: integer('reward_value').notNull(), // nominal Rp
  active: boolean('active').notNull().default(true),
  stock: integer('stock'), // nullable = unlimited
})

export const loyaltyRedemptions = pgTable('loyalty_redemptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  rewardId: uuid('reward_id').notNull().references(() => loyaltyRewards.id),
  pointsSpent: integer('points_spent').notNull(),
  status: text('status').notNull().default('used'), // 'used' | 'expired'
  usedAt: timestamp('used_at').notNull().defaultNow(),
})
```

#### Trigger SQL

Buat trigger yang auto-add poin saat order completed:

```sql
CREATE OR REPLACE FUNCTION add_loyalty_points()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'released' AND OLD.payment_status != 'released' THEN
    INSERT INTO loyalty_tiers (user_id, points, total_spent)
    VALUES (
      NEW.customer_id,
      FLOOR(NEW.base_amount / 1000),  -- 1 poin per Rp 1.000
      NEW.total_amount
    )
    ON CONFLICT (user_id) DO UPDATE SET
      points = loyalty_tiers.points + FLOOR(NEW.base_amount / 1000),
      total_spent = loyalty_tiers.total_spent + NEW.total_amount,
      updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER add_loyalty_points_trigger
AFTER UPDATE OF payment_status ON orders
FOR EACH ROW
WHEN (NEW.payment_status = 'released')
EXECUTE FUNCTION add_loyalty_points();
```

#### Tier System

| Tier | Syarat (total_spent) | Poin Multiplier | Benefit |
|------|---------------------|-----------------|---------|
| Bronze | Rp 0 | 1 poin per Rp 1.000 | — |
| Silver | Rp 500.000 | 1 poin per Rp 800 | Diskon platform fee 25% |
| Gold | Rp 2.000.000 | 1 poin per Rp 600 | Diskon platform fee 50% |
| Platinum | Rp 5.000.000 | 1 poin per Rp 500 | Gratis platform fee + prioritas support |

Fungsi kalkulasi tier:

```typescript
function getTier(totalSpent: number): { name: string; multiplier: number; color: string } {
  if (totalSpent >= 5_000_000) return { name: 'Platinum', multiplier: 500, color: 'text-blue-600' }
  if (totalSpent >= 2_000_000) return { name: 'Gold', multiplier: 600, color: 'text-amber-500' }
  if (totalSpent >= 500_000) return { name: 'Silver', multiplier: 800, color: 'text-gray-500' }
  return { name: 'Bronze', multiplier: 1000, color: 'text-orange-600' }
}
```

#### Rewards Catalog (Seed Data)

| Reward | Poin | Jenis | Nilai |
|--------|------|-------|-------|
| Diskon platform fee Rp 10.000 | 100 | discount | Rp 10.000 |
| Voucher Rp 25.000 | 250 | voucher | Rp 25.000 |
| TopUp saldo Rp 50.000 | 500 | topup | Rp 50.000 |
| TopUp saldo Rp 100.000 | 900 | topup | Rp 100.000 |

#### File yang Dibuat/Diubah

| File | Perubahan |
|------|-----------|
| `lib/db/schema.ts` | Tambah 3 table |
| Migration baru | Generate + apply |
| `lib/services/useLoyalty.ts` | **Baru:** hooks loyalty |
| **Baru:** `app/wallet/loyalty/page.tsx` | Halaman loyalty + rewards |
| `app/wallet/page.tsx` | Tambah card poin loyalty |
| `app/customer/profile/page.tsx` | Tambah tier badge + poin |

#### Hook: `useLoyalty`

```typescript
export function useLoyalty(userId: string | undefined) {
  return useQuery({
    queryKey: ['loyalty', userId],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('loyalty_tiers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()
      return data
    },
    enabled: !!userId,
  })
}

export function useLoyaltyRewards() {
  return useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('active', true)
        .order('points_required', { ascending: true })
      return data
    },
  })
}

export function useRedeemReward() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, rewardId, points }: {
      userId: string
      rewardId: string
      points: number
    }) => {
      const supabase = createClient()

      // 1. Kurangi poin
      const { error: deductError } = await supabase
        .from('loyalty_tiers')
        .update({ points: supabase.rpc('decrement', { x: points }) })
        .eq('user_id', userId)
      if (deductError) throw deductError

      // 2. Catat redemption
      const { error: redeemError } = await supabase
        .from('loyalty_redemptions')
        .insert({ user_id: userId, reward_id: rewardId, points_spent: points })
      if (redeemError) throw redeemError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] })
      queryClient.invalidateQueries({ queryKey: ['loyalty-rewards'] })
    },
  })
}
```

> **Catatan:** Untuk pengurangan poin, lebih baik buat RPC `decrement` di Supabase untuk atomic operation, atau gunakan `grest` dengan `return=representation`.

#### UI Loyalty di Wallet Page

Card di `app/wallet/page.tsx`:

```tsx
{profile && (
  <Link
    href="/wallet/loyalty"
    className="block p-4 bg-gradient-to-r from-purple-500 to-purple-700 rounded-2xl text-white"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm opacity-80">Poin Loyalty</p>
        <p className="text-2xl font-bold">{loyalty?.points || 0}</p>
        <p className="text-xs opacity-80">Tier: {tier.name}</p>
      </div>
      <div className="text-right">
        <Award className="w-10 h-10 opacity-80" />
        <p className="text-xs mt-1">Tukar Poin →</p>
      </div>
    </div>
    {/* Progress bar ke tier berikutnya */}
    <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
      <div
        className="h-full bg-white rounded-full transition-all"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  </Link>
)}
```

---

### 🥉 6. Chat Pattern Detection (Blur + Popup)

**Tujuan:** Deteksi nomor HP/email di chat → blur + peringatan escrow.

**Tidak perlu migration DB.** Murni frontend logic.

#### File yang Dibuat/Diubah

| File | Perubahan |
|------|-----------|
| **Baru:** `lib/utils/chatDetection.ts` | Utility regex + deteksi |
| **Baru:** `components/shared/ContactRevealModal.tsx` | Modal konfirmasi reveal |
| `app/customer/chat/detail/page.tsx` | Integrasi deteksi + blur |
| `app/vendor/chat/detail/page.tsx` | Sama |

#### Utility: `chatDetection.ts`

```typescript
// Pola nomor HP Indonesia
const PHONE_REGEX = /\b(0[8-9]\d{8,11})\b/g
// Pola email
const EMAIL_REGEX = /\b[\w.-]+@[\w.-]+\.\w+\b/g
// Pola username Instagram
const IG_REGEX = /@(\w{3,30})\b/g

export interface DetectedPattern {
  type: 'phone' | 'email' | 'instagram'
  value: string
  index: number
}

export function detectPatterns(text: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = []

  // Deteksi nomor HP
  let match
  while ((match = PHONE_REGEX.exec(text)) !== null) {
    patterns.push({ type: 'phone', value: match[1], index: match.index })
  }

  // Deteksi email
  while ((match = EMAIL_REGEX.exec(text)) !== null) {
    patterns.push({ type: 'email', value: match[0], index: match.index })
  }

  return patterns
}

export function maskText(text: string, patterns: DetectedPattern[]): string {
  let masked = text
  for (const p of patterns) {
    masked = masked.replace(p.value, '█'.repeat(p.value.length))
  }
  return masked
}
```

#### Component: `ContactRevealModal.tsx`

```tsx
'use client'

import { AlertTriangle, Eye, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ContactRevealModalProps {
  open: boolean
  patterns: { type: string; value: string }[]
  onConfirm: () => void
  onCancel: () => void
}

export function ContactRevealModal({ open, patterns, onConfirm, onCancel }: ContactRevealModalProps) {
  if (!open) return null

  const typeLabels: Record<string, string> = {
    phone: 'nomor telepon',
    email: 'alamat email',
    instagram: 'username Instagram',
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center pb-20">
      <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
        </div>

        <h3 className="text-lg font-semibold text-center mb-2">Perhatian!</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Pesan ini mengandung {patterns.map(p => typeLabels[p.type]).join(', ')}.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <div className="flex gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Transaksi di luar GEMA <strong>tidak dilindungi escrow</strong>.
              Dana Anda bisa hilang tanpa proteksi.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1 h-12">
            Kembali
          </Button>
          <Button onClick={onConfirm} className="flex-1 h-12 bg-amber-600 hover:bg-amber-700">
            <Eye className="w-4 h-4 mr-2" />
            Tetap Tampilkan
          </Button>
        </div>
      </div>
    </div>
  )
}
```

#### Integrasi di Chat Detail

```typescript
// Di dalam render message
const patterns = detectPatterns(msg.message || '')
const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set())
const [pendingReveal, setPendingReveal] = useState<string | null>(null)

// Render
{patterns.length > 0 && !revealedIds.has(msg.id) ? (
  <div className="relative">
    <p className="text-sm blur-sm select-none">
      {maskText(msg.message || '', patterns)}
    </p>
    <button
      onClick={() => setPendingReveal(msg.id)}
      className="absolute inset-0 flex items-center justify-center gap-1 bg-white/60 rounded-lg text-xs text-amber-600 font-medium"
    >
      <EyeOff className="w-3.5 h-3.5" />
      Tampilkan
    </button>
  </div>
) : (
  <p className="text-sm">{msg.message}</p>
)}

// Modal
<ContactRevealModal
  open={pendingReveal === msg.id}
  patterns={patterns}
  onConfirm={() => {
    setRevealedIds(prev => new Set(prev).add(msg.id))
    setPendingReveal(null)
  }}
  onCancel={() => setPendingReveal(null)}
/>
```

---

### 🥉 7. Auto-Invoice + Laporan Pajak

**Tujuan:** Setiap transaksi selesai → invoice HTML bisa di-print/save PDF. Vendor dapat laporan pendapatan bulanan.

#### Migration DB — Invoice Number Sequence

Format: `INV/YYYY/MM/XXXX` (sequential per bulan). Gunakan sequence + trigger untuk menjamin nomor unik, sequential, dan proper untuk audit trail pajak.

```sql
CREATE SEQUENCE invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  seq_num text;
BEGIN
  seq_num := LPAD(NEXTVAL('invoice_number_seq')::text, 4, '0');
  NEW.invoice_number := 'INV/' ||
    TO_CHAR(NEW.created_at, 'YYYY/MM/') || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE orders ADD COLUMN invoice_number text;

CREATE TRIGGER trg_orders_invoice_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_invoice_number();
```

Update baris yang sudah ada:

```sql
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn
  FROM orders WHERE invoice_number IS NULL
)
UPDATE orders o SET invoice_number =
  'INV/' || TO_CHAR(o.created_at, 'YYYY/MM/') || LPAD(n.rn::text, 4, '0')
FROM numbered n
WHERE o.id = n.id;
```

**Hasil contoh:**
| Order ID | created_at | invoice_number |
|----------|-----------|----------------|
| uuid-1 | 2026-06-01 | `INV/2026/06/0001` |
| uuid-2 | 2026-06-15 | `INV/2026/06/0002` |
| uuid-3 | 2026-07-01 | `INV/2026/06/0003` |

> **Catatan:** Sequence `invoice_number_seq` bersifat global — tidak reset per bulan. Format tetap menampilkan bulan tapi nomor urut terus naik. Jika ingin reset per bulan, buat function yang menyimpan counter bulanan di table terpisah.

#### File yang Dibuat/Diubah

| File | Perubahan |
|------|-----------|
| **Baru:** `lib/utils/invoice.ts` | Utility generate invoice data |
| **Baru:** `app/customer/orders/invoice/page.tsx` | Halaman invoice customer |
| **Baru:** `app/vendor/orders/invoice/page.tsx` | Halaman invoice vendor |
| `app/customer/orders/detail/page.tsx` | Tambah tombol "🧾 Lihat Invoice" |
| `app/vendor/orders/detail/page.tsx` | Tambah tombol "🧾 Lihat Invoice" |
| `app/vendor/earnings/page.tsx` | Tambah tombol "📊 Laporan Pajak Bulanan" |
| `app/vendor/earnings/page.tsx` | Halaman laporan bulanan (atau page terpisah) |

#### Utility: `invoice.ts`

```typescript
export interface InvoiceData {
  invoiceNumber: string
  date: string
  vendorName: string
  vendorAddress: string
  customerName: string
  customerAddress: string
  serviceName: string
  serviceCategory: string
  baseAmount: number
  platformFee: number
  totalAmount: number
  vendorPayout: number
  paymentStatus: string
  orderStatus: string
}

export function formatInvoiceData(order: Order, vendor: any, customer: any): InvoiceData {
  return {
    invoiceNumber: generateInvoiceNumber(order.id, new Date(order.created_at)),
    date: new Date(order.created_at).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
    vendorName: vendor?.full_name || '-',
    vendorAddress: vendor?.address_full || '-',
    customerName: customer?.full_name || '-',
    customerAddress: customer?.address_full || '-',
    serviceName: order.service_name,
    serviceCategory: order.service_category,
    baseAmount: order.base_amount,
    platformFee: order.platform_fee,
    totalAmount: order.total_amount,
    vendorPayout: order.vendor_payout,
    paymentStatus: order.payment_status,
    orderStatus: order.order_status,
  }
}

export function generateInvoiceNumber(orderId: string, date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const shortId = orderId.replace(/-/g, '').slice(0, 8).toUpperCase()
  return `INV/${year}/${month}/${shortId}`
}
```

#### Halaman Invoice

`app/customer/orders/invoice/page.tsx`:

Layout halaman:
- Wrapped `<Suspense>`
- Baca `order_id` dari `useSearchParams`
- Fetch order + vendor + customer data
- Render HTML invoice dengan gaya print-friendly
- Tombol "🖨️ Print / Simpan PDF" → `window.print()`

```tsx
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useOrder } from '@/lib/services/useOrders'
import { useVendor } from '@/lib/services/useVendors'
import { useUserProfile } from '@/lib/services/useUserProfile'
import { formatInvoiceData } from '@/lib/utils/invoice'
import { Printer } from 'lucide-react'
import { Loader2 } from 'lucide-react'

function InvoiceContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const { data: order } = useOrder(orderId!)
  const { data: vendor } = useVendor(order?.vendor_id)
  const { data: customer } = useUserProfile(order?.customer_id)

  if (!order || !vendor || !customer) return <Loader2 className="animate-spin" />

  const invoice = formatInvoiceData(order, vendor, customer)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Tombol Print */}
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 print:hidden">
        <h1 className="font-semibold">Invoice</h1>
        <button
          onClick={() => window.print()}
          className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Print / Simpan PDF
        </button>
      </div>

      {/* Invoice */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 print:p-4 min-h-[297mm] shadow-sm print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-emerald-600">GEMA</h2>
            <p className="text-sm text-gray-500">Invoice / Faktur</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-mono text-gray-600">{invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-500">{invoice.date}</p>
          </div>
        </div>

        {/* Dari / Kepada */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase mb-1">Dari (Vendor)</p>
            <p className="font-medium">{invoice.vendorName}</p>
            <p className="text-sm text-gray-600">{invoice.vendorAddress}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase mb-1">Kepada (Customer)</p>
            <p className="font-medium">{invoice.customerName}</p>
            <p className="text-sm text-gray-600">{invoice.customerAddress}</p>
          </div>
        </div>

        {/* Tabel Jasa */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-sm text-gray-500">Jasa</th>
              <th className="text-right py-2 text-sm text-gray-500">Kategori</th>
              <th className="text-right py-2 text-sm text-gray-500">Harga</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100">
              <td className="py-3">{invoice.serviceName}</td>
              <td className="py-3 text-right text-sm text-gray-600">{invoice.serviceCategory}</td>
              <td className="py-3 text-right font-mono">
                Rp {invoice.baseAmount.toLocaleString('id-ID')}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} className="py-2 text-sm text-gray-500">Biaya Platform (5%)</td>
              <td className="py-2 text-right font-mono">
                Rp {invoice.platformFee.toLocaleString('id-ID')}
              </td>
            </tr>
            <tr className="font-bold">
              <td colSpan={2} className="py-2">Total Pembayaran</td>
              <td className="py-2 text-right font-mono text-emerald-600">
                Rp {invoice.totalAmount.toLocaleString('id-ID')}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Status */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${
          invoice.paymentStatus === 'released'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-blue-100 text-blue-700'
        }`}>
          {invoice.paymentStatus === 'released' ? '✅ Lunas' : '💰 Dalam Escrow'}
        </div>

        {/* Footer */}
        <div className="mt-16 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
          <p>Invoice ini sah dan diproses oleh GEMA.</p>
          <p>Terima kasih telah menggunakan GEMA.</p>
        </div>
      </div>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <InvoiceContent />
    </Suspense>
  )
}
```

> **Catatan:** `useUserProfile(userId)` mungkin belum ada — perlu dibuat atau gunakan query langsung ke `users` table.

#### Laporan Pajak Vendor

Di `app/vendor/earnings/page.tsx`, tambah:

```tsx
<Link
  href={`/vendor/earnings/report?month=${selectedMonth}&year={selectedYear}`}
  className="h-12 rounded-xl bg-white border border-gray-200 flex items-center justify-center gap-2 text-sm"
>
  <FileText className="w-4 h-4" />
  📊 Laporan Bulanan
</Link>
```

Halaman `/vendor/earnings/report/page.tsx`:
- Filter bulan/tahun (dropdown atau prev/next)
- Tampilkan: total revenue, total fee, total payout, jumlah order
- Tabel detail per transaksi: tanggal, jasa, customer, nominal
- Tombol print
- Style: putih bersih, font monospace untuk nominal, cocok untuk arsip pajak

---

## Ringkasan Total Perubahan

### Database Migrations

| Priority | Table Baru | Kolom Baru | Trigger |
|----------|-----------|------------|---------|
| 4 | `vendor_operating_hours`, `vendor_date_blocks` | — | — |
| 5 | `loyalty_tiers`, `loyalty_rewards`, `loyalty_redemptions` | — | `add_loyalty_points_trigger` on `orders` |
| 7 | — | `invoice_number` (on orders) | `trg_orders_invoice_number` function `generate_invoice_number()` |

### File Baru

| File | Priority |
|------|----------|
| `components/shared/ContactRevealModal.tsx` | 6 |
| `lib/utils/chatDetection.ts` | 6 |
| `lib/services/useLoyalty.ts` | 5 |
| `app/vendor/settings/schedule/page.tsx` | 4 |
| `app/wallet/loyalty/page.tsx` | 5 |
| `app/customer/orders/invoice/page.tsx` | 7 |
| `app/vendor/orders/invoice/page.tsx` | 7 |
| `app/vendor/earnings/report/page.tsx` | 7 |

### File Diubah

| File | Priority |
|------|----------|
| `app/customer/chat/detail/page.tsx` | 1, 3, 6 |
| `app/vendor/chat/detail/page.tsx` | 1, 3, 6 |
| `app/customer/orders/detail/page.tsx` | 1, 2, 7 |
| `app/customer/orders/page.tsx` | 1, 2 |
| `app/customer/payment/success/page.tsx` | 1 |
| `app/customer/booking/page.tsx` | 2, 4 |
| `app/customer/vendor/page.tsx` | 4 |
| `app/customer/profile/page.tsx` | 5 |
| `app/vendor/orders/detail/page.tsx` | 1, 3, 7 |
| `app/vendor/profile/edit/page.tsx` | 4 |
| `app/vendor/dashboard/page.tsx` | 4 |
| `app/vendor/earnings/page.tsx` | 7 |
| `app/wallet/page.tsx` | 5 |
| `lib/services/useChat.ts` | 3 |
| `lib/services/useOrders.ts` | 2 (minor) |
| `lib/services/useVendors.ts` | 4 |
| `lib/db/schema.ts` | 4, 5, 7 |

---

## Keputusan yang Sudah Dikonfirmasi

Pertanyaan-pertanyaan berikut sudah dijawab oleh founder pada 2026-05-27:

| # | Pertanyaan | Keputusan |
|---|-----------|-----------|
| 1 | **Loyalty redeem flow:** Setelah customer redeem reward "TopUp Rp 50.000", bagaimana dana dikirim? | ✅ **Langsung masuk wallet** via RPC `credit_wallet`. Tidak perlu konfirmasi admin. |
| 2 | **Chat images storage bucket:** Public read atau authenticated read? | ✅ **Public read** — gambar bisa di-load tanpa auth, lebih cepat via CDN. |
| 3 | **System messages sender_id:** Gunakan `null` atau UUID khusus? | ✅ **`sender_id = null`** — deteksi di UI dengan `!msg.sender_id`. |
| 4 | **Invoice number format:** Auto-generate dari frontend atau DB trigger? | ✅ **DB trigger + sequence** — sequential per month (`INV/YYYY/MM/XXXX`), proper untuk audit pajak. Migration ada di Priority 7. |
| 5 | **Laporan pajak:** Cukup PDF atau perlu export Excel/CSV? | ✅ **Print-to-PDF** cukup untuk MVP. |

---

**Document Version**: 1.0.0
**Last Updated**: 2026-05-27
