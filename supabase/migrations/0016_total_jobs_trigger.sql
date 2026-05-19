CREATE OR REPLACE FUNCTION recalc_vendor_total_jobs()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE vendor_profiles
    SET total_jobs = (
      SELECT COUNT(*) FROM orders
      WHERE vendor_id = OLD.vendor_id AND order_status = 'completed'
    )
    WHERE user_id = OLD.vendor_id;
  ELSE
    UPDATE vendor_profiles
    SET total_jobs = (
      SELECT COUNT(*) FROM orders
      WHERE vendor_id = NEW.vendor_id AND order_status = 'completed'
    )
    WHERE user_id = NEW.vendor_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_update_vendor_total_jobs
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION recalc_vendor_total_jobs();

UPDATE vendor_profiles v
SET total_jobs = (
  SELECT COUNT(*) FROM orders
  WHERE vendor_id = v.user_id AND order_status = 'completed'
);
