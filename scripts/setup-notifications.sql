-- ===============================================
-- NOTIFICATION SYSTEM SETUP SCRIPT
-- Run this in your Supabase SQL Editor
-- ===============================================

-- 1. First, let's check if the trigger exists
SELECT 
  trigger_name, 
  event_manipulation, 
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'orders_status_change_trigger';

-- 2. Check if the function exists
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'notify_status_change';

-- 3. Create the notification function (replace YOUR_PROJECT_ID with your actual Supabase project ID)
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  edge_function_url TEXT;
  http_response RECORD;
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RAISE LOG 'Status unchanged for order %, skipping notification', NEW.id;
    RETURN NEW;
  END IF;

  RAISE LOG 'Status changed for order % from % to %', NEW.id, OLD.status, NEW.status;

  -- Replace 'kpzzmuinlssmfbtcxtrg' with your actual Supabase project ID
  -- You can find this in your Supabase dashboard URL: https://supabase.com/dashboard/project/YOUR_PROJECT_ID
  edge_function_url := 'https://kpzzmuinlssmfbtcxtrg.supabase.co/functions/v1/notify-status-change';

  -- Prepare payload
  payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW),
    'old_record', to_jsonb(OLD)
  );

  RAISE LOG 'Calling Edge Function with payload: %', payload;

  -- Call Edge Function (this requires the http extension)
  -- If you get an error here, you may need to enable the http extension
  BEGIN
    SELECT INTO http_response * FROM http_post(
      edge_function_url,
      payload::text,
      'application/json',
      jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      )
    );
    
    RAISE LOG 'Edge Function response: status=%, content=%', http_response.status, http_response.content;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to call Edge Function: %', SQLERRM;
      
      -- Fallback: Insert notification directly into database
      INSERT INTO notifications (user_id, title, message, type, data, is_read)
      SELECT 
        NEW.customer_id,
        'Order Status Updated',
        'Your order #' || UPPER(RIGHT(NEW.id::text, 8)) || ' status has been updated to: ' || REPLACE(NEW.status::text, '_', ' '),
        CASE NEW.status
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
        END,
        jsonb_build_object('orderId', NEW.id, 'status', NEW.status),
        false
      WHERE NEW.customer_id IS NOT NULL;
      
      RAISE LOG 'Fallback notification inserted directly into database';
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger
DROP TRIGGER IF EXISTS orders_status_change_trigger ON orders;
CREATE TRIGGER orders_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_status_change();

-- 5. Set up the service role key (replace with your actual service role key)
-- You can find this in Supabase Dashboard -> Settings -> API -> service_role key
-- SELECT set_config('app.settings.service_role_key', 'YOUR_SERVICE_ROLE_KEY_HERE', false);

-- 6. Test the setup by checking recent orders
SELECT 
  id,
  customer_id,
  status,
  created_at,
  updated_at
FROM orders 
ORDER BY updated_at DESC 
LIMIT 5;

-- 7. Check recent notifications
SELECT 
  id,
  user_id,
  title,
  message,
  type,
  created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

-- ===============================================
-- MANUAL TEST INSTRUCTIONS:
-- ===============================================
-- After running this script:
-- 1. Update an order status manually to test:
--    UPDATE orders SET status = 'vendor_assigned' WHERE id = 'some-order-id';
-- 2. Check if a notification was created:
--    SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
-- 3. Look at the Postgres logs for debug messages
-- =============================================== 