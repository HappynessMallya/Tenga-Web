-- Quick Fix for Duplicate Services
-- Run this in your Supabase SQL editor

-- Step 1: Show current state
SELECT 'BEFORE CLEANUP' as status, id, name, display_name, icon_name, is_active, created_at 
FROM service_types 
WHERE is_active = true
ORDER BY display_name, created_at;

-- Step 2: Delete ALL active service types (this will cascade to service_items)
DELETE FROM service_types WHERE is_active = true;

-- Step 3: Insert exactly 3 services with correct names
INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at) 
VALUES 
(uuid_generate_v4(), 'wash_fold', 'Wash & Fold', 'Standard washing and folding service', 'wash_fold', 24, 2000, true, NOW()),
(uuid_generate_v4(), 'dry_clean', 'Dry Cleaning', 'Professional dry cleaning service', 'dry_clean', 48, 5000, true, NOW()),
(uuid_generate_v4(), 'iron', 'Iron Only', 'Professional ironing service', 'iron', 12, 1500, true, NOW());

-- Step 4: Show final state
SELECT 'AFTER CLEANUP' as status, id, name, display_name, icon_name, is_active, created_at 
FROM service_types 
WHERE is_active = true
ORDER BY display_name; 