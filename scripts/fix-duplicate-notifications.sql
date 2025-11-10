-- ===============================================
-- FIX DUPLICATE NOTIFICATIONS
-- ===============================================

-- 1. Add a unique constraint to prevent duplicate notifications for the same order status
-- First, let's see if there are existing duplicates
SELECT 
  user_id,
  data->>'orderId' as order_id,
  data->>'status' as status,
  COUNT(*) as count
FROM notifications 
WHERE data->>'orderId' IS NOT NULL
GROUP BY user_id, data->>'orderId', data->>'status'
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Clean up existing duplicates (keep only the latest one)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, data->>'orderId', data->>'status' 
      ORDER BY created_at DESC
    ) as rn
  FROM notifications 
  WHERE data->>'orderId' IS NOT NULL
)
DELETE FROM notifications 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Create a better notification function that prevents duplicates
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
  existing_notification_count INTEGER;
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RAISE LOG 'Status unchanged for order %, skipping notification', NEW.id;
    RETURN NEW;
  END IF;

  RAISE LOG 'Status changed for order % from % to %', NEW.id, OLD.status, NEW.status;

  -- Check if notification already exists for this order and status
  SELECT COUNT(*) INTO existing_notification_count
  FROM notifications 
  WHERE user_id = NEW.customer_id 
    AND data->>'orderId' = NEW.id::text
    AND data->>'status' = NEW.status::text;

  IF existing_notification_count > 0 THEN
    RAISE LOG 'Notification already exists for order % with status %, skipping', NEW.id, NEW.status;
    RETURN NEW;
  END IF;

  -- Insert notification directly into database (no Edge Function)
  INSERT INTO notifications (user_id, title, message, type, data, is_read)
  SELECT 
    NEW.customer_id,
    'Order Status Updated',
    'Your order #' || UPPER(RIGHT(NEW.id::text, 8)) || ' status has been updated to: ' || REPLACE(NEW.status::text, '_', ' '),
    CASE NEW.status
      WHEN 'pending' THEN 'order_placed'::notification_type
      WHEN 'vendor_assigned' THEN 'order_accepted'::notification_type
      WHEN 'picked_up' THEN 'order_picked_up'::notification_type
      WHEN 'washing' THEN 'order_washing'::notification_type
      WHEN 'washing_completed' THEN 'order_completed'::notification_type
      WHEN 'ready_for_delivery' THEN 'order_completed'::notification_type
      WHEN 'out_for_delivery' THEN 'order_out_for_delivery'::notification_type
      WHEN 'delivered' THEN 'order_delivered'::notification_type
      WHEN 'cancelled' THEN 'order_cancelled'::notification_type
      WHEN 'refunded' THEN 'order_cancelled'::notification_type
      ELSE 'system_announcement'::notification_type
    END,
    jsonb_build_object('orderId', NEW.id, 'status', NEW.status),
    false
  WHERE NEW.customer_id IS NOT NULL;
  
  RAISE LOG 'Notification inserted for order % with status %', NEW.id, NEW.status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
DROP TRIGGER IF EXISTS orders_status_change_trigger ON orders;
CREATE TRIGGER orders_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_status_change();

-- 5. Add a partial unique index to prevent future duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_unique_order_status 
ON notifications (user_id, (data->>'orderId'), (data->>'status'))
WHERE data->>'orderId' IS NOT NULL;

-- 6. Test by checking for any remaining duplicates
SELECT 
  user_id,
  data->>'orderId' as order_id,
  data->>'status' as status,
  COUNT(*) as count
FROM notifications 
WHERE data->>'orderId' IS NOT NULL
GROUP BY user_id, data->>'orderId', data->>'status'
HAVING COUNT(*) > 1;

-- 7. Verify setup is complete
SELECT 'Duplicate notification prevention setup complete!' as status; 