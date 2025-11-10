-- ===============================================
-- SIMPLE NOTIFICATION TEST
-- Run this in your Supabase SQL Editor to test notifications
-- ===============================================

-- 1. Check if notifications table exists and see recent notifications
SELECT COUNT(*) as notification_count FROM notifications;
SELECT 
  id,
  user_id,
  title,
  message,
  type,
  created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check recent orders and their status changes
SELECT 
  id,
  customer_id,
  vendor_id,
  status,
  created_at,
  updated_at
FROM orders 
ORDER BY updated_at DESC 
LIMIT 10;

-- 3. MANUAL TEST: Find a recent order and manually create a notification
-- (Replace the order ID and customer ID below with real values from step 2)
INSERT INTO notifications (user_id, title, message, type, data, is_read)
VALUES (
  '7408bb81-0aad-4c13-b624-ea12cb4ac693', -- Replace with actual customer_id from orders table
  'Test Notification 🧪',
  'This is a test notification to verify the system is working.',
  'system_announcement',
  '{"test": true, "orderId": "test-order-123"}',
  false
);

-- 4. Check if the notification was created
SELECT 
  id,
  user_id,
  title,
  message,
  type,
  created_at
FROM notifications 
WHERE title LIKE '%Test Notification%'
ORDER BY created_at DESC;

-- 5. Create a simple function to test status change notifications
CREATE OR REPLACE FUNCTION test_order_notification(order_id TEXT, new_status TEXT)
RETURNS TEXT AS $$
DECLARE
  order_record RECORD;
  notification_type TEXT;
  result_message TEXT;
BEGIN
  -- Get order details
  SELECT * INTO order_record FROM orders WHERE id = order_id::UUID;
  
  IF NOT FOUND THEN
    RETURN 'Order not found: ' || order_id;
  END IF;
  
  -- Map status to notification type
  notification_type := CASE new_status
    WHEN 'pending' THEN 'order_placed'
    WHEN 'vendor_assigned' THEN 'order_accepted'
    WHEN 'picked_up' THEN 'order_picked_up'
    WHEN 'washing' THEN 'order_washing'
    WHEN 'washing_completed' THEN 'order_completed'
    WHEN 'ready_for_delivery' THEN 'order_completed'
    WHEN 'out_for_delivery' THEN 'order_out_for_delivery'
    WHEN 'delivered' THEN 'order_delivered'
    WHEN 'cancelled' THEN 'order_cancelled'
    WHEN 'refunded' THEN 'order_cancelled'
    ELSE 'system_announcement'
  END;
  
  -- Insert notification
  INSERT INTO notifications (user_id, title, message, type, data, is_read)
  VALUES (
    order_record.customer_id,
    'Order Status Updated',
    'Your order #' || UPPER(RIGHT(order_record.id::text, 8)) || ' status has been updated to: ' || REPLACE(new_status::text, '_', ' '),
    notification_type,
    jsonb_build_object('orderId', order_record.id, 'status', new_status),
    false
  );
  
  result_message := 'Notification created for order ' || order_id || ' with status ' || new_status;
  
  RETURN result_message;
END;
$$ LANGUAGE plpgsql;

-- 6. USAGE INSTRUCTIONS:
-- After running this script, test with a real order ID:
-- SELECT test_order_notification('your-actual-order-id', 'vendor_assigned');

-- 7. Check if the test notification was created:
-- SELECT * FROM notifications WHERE message LIKE '%Order Status Updated%' ORDER BY created_at DESC LIMIT 5; 