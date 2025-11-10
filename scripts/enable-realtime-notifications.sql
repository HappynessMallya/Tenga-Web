-- Enable real-time for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Verify notifications table real-time is enabled
SELECT 
  pg_namespace.nspname as schema_name,
  pg_class.relname as table_name,
  pg_publication.pubname as publication_name
FROM pg_publication_rel
JOIN pg_publication ON pg_publication.oid = pg_publication_rel.prpubid
JOIN pg_class ON pg_class.oid = pg_publication_rel.prrelid
JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
WHERE pg_publication.pubname = 'supabase_realtime'
  AND pg_namespace.nspname = 'public'
  AND pg_class.relname = 'notifications'; 