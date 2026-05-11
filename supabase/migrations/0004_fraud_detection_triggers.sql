-- Phase 8: Fraud Detection Triggers
-- Auto-detect suspicious patterns and insert into fraud_alerts

-- ===== 1. ADD MISSING COLUMNS TO ORDERS =====
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT now() NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT now() NOT NULL;

-- Backfill existing orders
UPDATE orders SET created_at = COALESCE(completed_at, now()) WHERE created_at IS NULL;
UPDATE orders SET updated_at = COALESCE(completed_at, now()) WHERE updated_at IS NULL;

-- Auto-update updated_at on any order update
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_orders_updated_at ON orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_orders_updated_at();

-- ===== 2. INDEXES FOR FRAUD QUERIES =====
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_vendor ON reviews(customer_id, vendor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_type_status ON fraud_alerts(type, status);

-- ===== 3. FRAUD DETECTION TRIGGERS =====

-- 3a. SELF-DEALING: Prevent customer == vendor orders
CREATE OR REPLACE FUNCTION detect_self_dealing()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.customer_id = NEW.vendor_id THEN
    INSERT INTO fraud_alerts (
      type, severity, title, description, affected_user_id, related_order_id, metadata
    ) VALUES (
      'self_dealing', 'high',
      'Transaksi Mandiri Terdeteksi',
      'Percobaan transaksi dengan customer dan vendor sebagai pengguna yang sama',
      NEW.customer_id, NULL,
      jsonb_build_object('customer_id', NEW.customer_id, 'vendor_id', NEW.vendor_id)
    );
    RAISE EXCEPTION 'Self-dealing detected: customer and vendor cannot be the same user';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_insert_order_self_dealing ON orders;
CREATE TRIGGER before_insert_order_self_dealing
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION detect_self_dealing();

-- 3b. RAPID COMPLETION: Order completed suspiciously fast
CREATE OR REPLACE FUNCTION detect_rapid_completion()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  duration_minutes integer;
BEGIN
  IF NEW.order_status = 'completed' AND OLD.order_status = 'in_progress' THEN
    duration_minutes := EXTRACT(EPOCH FROM (NEW.completed_at - OLD.created_at)) / 60;
    IF duration_minutes < 30 AND OLD.payment_status = 'escrow' THEN
      IF NOT EXISTS (
        SELECT 1 FROM fraud_alerts
        WHERE type = 'rapid_completion' AND related_order_id = NEW.id
      ) THEN
        INSERT INTO fraud_alerts (
          type, severity, title, description, affected_vendor_id, related_order_id, metadata
        ) VALUES (
          'rapid_completion', 'medium',
          'Penyelesaian Pesanan Terlalu Cepat',
          'Pesanan selesai dalam ' || duration_minutes || ' menit (threshold: 30 menit)',
          NEW.vendor_id, NEW.id,
          jsonb_build_object(
            'order_id', NEW.id, 'duration_minutes', duration_minutes,
            'vendor_id', NEW.vendor_id, 'created_at', OLD.created_at,
            'completed_at', NEW.completed_at
          )
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_update_order_rapid_completion ON orders;
CREATE TRIGGER after_update_order_rapid_completion
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION detect_rapid_completion();

-- 3c. BURST REGISTRATION: Multiple users registered in short time
CREATE OR REPLACE FUNCTION detect_burst_registration()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  recent_count integer;
BEGIN
  SELECT COUNT(*) INTO recent_count
  FROM users
  WHERE created_at > NOW() - INTERVAL '1 hour';

  IF recent_count > 5 THEN
    IF NOT EXISTS (
      SELECT 1 FROM fraud_alerts
      WHERE type = 'burst_registration' AND status = 'open'
        AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
      INSERT INTO fraud_alerts (
        type, severity, title, description, metadata
      ) VALUES (
        'burst_registration', 'medium',
        'Registrasi Massal Terdeteksi',
        recent_count || ' pengguna terdaftar dalam 1 jam terakhir (threshold: 5)',
        jsonb_build_object('user_count', recent_count, 'window_hours', 1)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_user_burst_registration ON users;
CREATE TRIGGER after_insert_user_burst_registration
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION detect_burst_registration();

-- 3d. REVIEW BOMB: Multiple low ratings from same customer to same vendor
CREATE OR REPLACE FUNCTION detect_review_bomb()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  low_rating_count integer;
BEGIN
  IF NEW.rating <= 2 THEN
    SELECT COUNT(*) INTO low_rating_count
    FROM reviews
    WHERE customer_id = NEW.customer_id
      AND vendor_id = NEW.vendor_id
      AND rating <= 2
      AND created_at > NOW() - INTERVAL '24 hours';

    IF low_rating_count > 3 THEN
      IF NOT EXISTS (
        SELECT 1 FROM fraud_alerts
        WHERE type = 'review_bomb'
          AND (metadata->>'customer_id')::uuid = NEW.customer_id
          AND (metadata->>'vendor_id')::uuid = NEW.vendor_id
          AND created_at > NOW() - INTERVAL '24 hours'
      ) THEN
        INSERT INTO fraud_alerts (
          type, severity, title, description,
          affected_user_id, affected_vendor_id, related_order_id, metadata
        ) VALUES (
          'review_bomb', 'medium',
          'Review Bomb Terdeteksi',
          'Pengguna memberikan ' || low_rating_count || ' rating rendah (<=2) ke vendor yang sama dalam 24 jam',
          NEW.customer_id, NEW.vendor_id, NEW.order_id,
          jsonb_build_object(
            'customer_id', NEW.customer_id, 'vendor_id', NEW.vendor_id,
            'low_rating_count', low_rating_count, 'window_hours', 24
          )
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_review_bomb ON reviews;
CREATE TRIGGER after_insert_review_bomb
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION detect_review_bomb();

-- 3e. OFF-PLATFORM CONTACT: Messages containing contact info
CREATE OR REPLACE FUNCTION detect_off_platform_contact()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.message IS NOT NULL AND NEW.message ~ (
    '(08[0-9]{8,}|https?://(wa\.me|t\.me|line\.me|bit\.ly)|@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'
  ) THEN
    IF NOT EXISTS (
      SELECT 1 FROM fraud_alerts
      WHERE type = 'off_platform' AND related_order_id = (
        SELECT order_id FROM chats WHERE id = NEW.chat_id
      ) AND created_at > NOW() - INTERVAL '1 hour'
    ) THEN
      INSERT INTO fraud_alerts (
        type, severity, title, description,
        affected_user_id, related_order_id, metadata
      ) VALUES (
        'off_platform', 'medium',
        'Kontak Off-Platform Terdeteksi',
        'Pesan mengandung informasi kontak (nomor telepon/email/social media)',
        NEW.sender_id,
        (SELECT order_id FROM chats WHERE id = NEW.chat_id),
        jsonb_build_object(
          'sender_id', NEW.sender_id, 'message_id', NEW.id,
          'preview', LEFT(NEW.message, 200)
        )
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_insert_message_off_platform ON messages;
CREATE TRIGGER after_insert_message_off_platform
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION detect_off_platform_contact();
