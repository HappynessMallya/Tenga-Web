-- Clean up duplicate service types and ensure consistency
-- Run this in your Supabase SQL editor

-- First, let's see what we have
SELECT id, name, display_name, icon_name, is_active, created_at 
FROM service_types 
ORDER BY display_name, created_at;

-- Step 1: Create temporary mapping of old IDs to new standardized IDs
-- We'll keep the most recent service type for each display_name and map others to it

-- First, let's identify which service types to keep (most recent for each display_name)
WITH service_mapping AS (
  SELECT 
    id,
    display_name,
    ROW_NUMBER() OVER (PARTITION BY LOWER(display_name) ORDER BY created_at DESC) as rn
  FROM service_types
  WHERE is_active = true
),
keepers AS (
  SELECT id, display_name
  FROM service_mapping
  WHERE rn = 1
),
duplicates AS (
  SELECT id, display_name
  FROM service_mapping
  WHERE rn > 1
)

-- Step 2: Update service_items to reference the kept service types instead of duplicates
UPDATE service_items 
SET service_type_id = keepers.id
FROM duplicates, keepers
WHERE service_items.service_type_id = duplicates.id
  AND LOWER(duplicates.display_name) = LOWER(keepers.display_name);

-- Step 3: Now we can safely delete the duplicate service types
DELETE FROM service_types 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY LOWER(display_name) ORDER BY created_at DESC) as rn
    FROM service_types
    WHERE is_active = true
  ) t
  WHERE t.rn > 1
);

-- Step 4: Update the remaining service types to have consistent names
UPDATE service_types 
SET 
  display_name = CASE 
    WHEN LOWER(display_name) LIKE '%wash%fold%' THEN 'Wash & Fold'
    WHEN LOWER(display_name) LIKE '%dry%clean%' THEN 'Dry Cleaning'
    WHEN LOWER(display_name) LIKE '%iron%' THEN 'Iron Only'
    ELSE display_name
  END,
  name = CASE 
    WHEN LOWER(display_name) LIKE '%wash%fold%' THEN 'wash_fold'
    WHEN LOWER(display_name) LIKE '%dry%clean%' THEN 'dry_clean'
    WHEN LOWER(display_name) LIKE '%iron%' THEN 'iron'
    ELSE name
  END,
  icon_name = CASE 
    WHEN LOWER(display_name) LIKE '%wash%fold%' THEN 'wash_fold'
    WHEN LOWER(display_name) LIKE '%dry%clean%' THEN 'dry_clean'
    WHEN LOWER(display_name) LIKE '%iron%' THEN 'iron'
    ELSE icon_name
  END
WHERE is_active = true;

-- Step 5: Ensure we have exactly 3 service types
-- If we're missing any, add them
INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at) 
SELECT 
  uuid_generate_v4(), 
  'wash_fold', 
  'Wash & Fold', 
  'Standard washing and folding service', 
  'wash_fold', 
  24, 
  2000, 
  true, 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_types WHERE LOWER(display_name) LIKE '%wash%fold%' AND is_active = true);

INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at) 
SELECT 
  uuid_generate_v4(), 
  'dry_clean', 
  'Dry Cleaning', 
  'Professional dry cleaning service', 
  'dry_clean', 
  48, 
  5000, 
  true, 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_types WHERE LOWER(display_name) LIKE '%dry%clean%' AND is_active = true);

INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at) 
SELECT 
  uuid_generate_v4(), 
  'iron', 
  'Iron Only', 
  'Professional ironing service', 
  'iron', 
  12, 
  1500, 
  true, 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM service_types WHERE LOWER(display_name) LIKE '%iron%' AND is_active = true);

-- Verify the results
SELECT id, name, display_name, icon_name, is_active, created_at 
FROM service_types 
WHERE is_active = true
ORDER BY display_name; 