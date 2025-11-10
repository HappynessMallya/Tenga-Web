# Push Notifications Setup Guide

## 1. Deploy the Edge Function

```bash
# Deploy the Edge Function to Supabase
supabase functions deploy notify-status-change

# Or if you have a specific project
supabase functions deploy notify-status-change --project-ref your-project-id
```

## 2. Run the Database Migration

```bash
# Apply the migration
supabase db push

# Or run the SQL directly in your Supabase SQL editor
```

## 3. Update the Database Trigger

In your Supabase SQL editor, update the trigger function with your actual project ID:

```sql
-- Update the edge function URL with your actual project ID
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  edge_function_url TEXT;
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Replace 'your-project-id' with your actual Supabase project ID
  edge_function_url := 'https://YOUR_ACTUAL_PROJECT_ID.supabase.co/functions/v1/notify-status-change';

  -- Prepare payload
  payload := jsonb_build_object(
    'table', TG_TABLE_NAME,
    'record', to_jsonb(NEW),
    'old_record', to_jsonb(OLD)
  );

  -- Call Edge Function asynchronously
  PERFORM
    net.http_post(
      url := edge_function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := payload::text
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to call notify-status-change function: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 4. Set up Supabase Settings

In your Supabase project settings, add the service role key:

```sql
-- Set the service role key (run this in SQL editor)
SELECT set_config('app.settings.service_role_key', 'YOUR_SERVICE_ROLE_KEY', false);
```

## 5. Test the System

1. Build and deploy your app with EAS
2. Register a user and ensure they get a push token
3. Create/update an order status to trigger notifications
4. Check the Edge Function logs in Supabase

## 6. Troubleshooting

### Common Issues:

1. **Push tokens not working**: Make sure you're using EAS build, not Expo Go
2. **Notifications not sending**: Check Edge Function logs for errors
3. **Trigger not firing**: Verify the trigger is created on the correct table
4. **HTTP errors**: Ensure your service role key is set correctly

### Debug Steps:

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers WHERE trigger_name = 'orders_status_change_trigger';

-- Check if push tokens are being stored
SELECT * FROM user_push_tokens;

-- Check notifications table
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;
```

## 7. Production Checklist

- [ ] Edge Function deployed and tested
- [ ] Database migration applied
- [ ] Trigger function updated with correct project ID
- [ ] Service role key configured
- [ ] Push tokens being generated and stored
- [ ] Notifications appearing in app
- [ ] Error handling working correctly
