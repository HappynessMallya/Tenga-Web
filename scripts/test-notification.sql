-- Test notification to see if real-time works
-- Replace 'YOUR_USER_ID' with an actual user ID from your users table

-- First, find a customer user ID
SELECT id, full_name, email 
FROM users 
WHERE id IN (SELECT id FROM customers)
LIMIT 5;

-- Insert a test notification (replace with actual user ID)
INSERT INTO notifications (
  user_id,
  title,
  message,
  type,
  data,
  is_read,
  created_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual user ID
  'Test Notification 🧪',
  'This is a test notification to check if real-time updates work in the app.',
  'system_announcement',
  jsonb_build_object('test', true, 'timestamp', NOW()::text),
  false,
  NOW()
);

-- Check if notification was created
SELECT 
  id,
  title,
  message,
  type,
  created_at,
  is_read
FROM notifications 
WHERE title = 'Test Notification 🧪'
ORDER BY created_at DESC
LIMIT 1; 