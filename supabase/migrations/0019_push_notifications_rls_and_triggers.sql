-- PUSH NOTIFICATIONS: RLS Policies, Indexes, Triggers
-- Run after 0018_push_notifications_tables.sql

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Unique constraints
ALTER TABLE push_tokens ADD CONSTRAINT push_tokens_token_unique UNIQUE (token);
ALTER TABLE notification_preferences ADD CONSTRAINT notification_preferences_user_id_channel_unique UNIQUE (user_id, channel);

-- RLS: Enable
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS: push_tokens
CREATE POLICY "push_tokens_select_own" ON push_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_insert_own" ON push_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "push_tokens_update_own" ON push_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "push_tokens_delete_own" ON push_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- RLS: notification_preferences
CREATE POLICY "notification_preferences_select_own" ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notification_preferences_insert_own" ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notification_preferences_update_own" ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS: notifications
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: seed default notification preferences on user registration
CREATE OR REPLACE FUNCTION seed_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, channel) VALUES
    (NEW.id, 'order'),
    (NEW.id, 'chat'),
    (NEW.id, 'promo'),
    (NEW.id, 'system');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS after_user_insert ON users;
CREATE TRIGGER after_user_insert
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION seed_notification_preferences();
