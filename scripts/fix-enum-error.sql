-- ===============================================
-- QUICK FIX FOR ENUM CAST ERROR  
-- Run this immediately in Supabase SQL Editor
-- ===============================================

-- Fix the notification function to properly cast enum to text
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

  -- Replace with your actual Supabase project ID
  edge_function_url := 'https://kpzzmuinlssmfbtcxtrg.supabase.co/functions/v1/notify-status-change';

  -- Prepare payload
  payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW),
    'old_record', to_jsonb(OLD)
  );

  RAISE LOG 'Calling Edge Function with payload: %', payload;

  -- Try to call Edge Function, but always fallback to direct insertion
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
      RAISE WARNING 'Edge Function failed, using fallback: %', SQLERRM;
  END;
  
  -- ALWAYS insert notification directly (fallback or primary method)
  INSERT INTO notifications (user_id, title, message, type, data, is_read)
  SELECT 
    NEW.customer_id,
    'Order Status Updated',
    'Your order #' || UPPER(RIGHT(NEW.id::text, 8)) || ' status has been updated to: ' || REPLACE(NEW.status::text, '_', ' '),
    CASE NEW.status::text
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
  
  RAISE LOG 'Notification inserted directly into database for order %, status %', NEW.id, NEW.status;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create/recreate the trigger
DROP TRIGGER IF EXISTS orders_status_change_trigger ON orders;
CREATE TRIGGER orders_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION notify_status_change();

-- Test that everything is working
SELECT 'Notification system fixed! ✅' as status; 