-- Update Service Items with Realistic Pricing
-- This script updates the pricing to be more realistic for Tanzania

-- Update Wash & Fold items (most affordable)
UPDATE service_items 
SET price_tsh = CASE 
  -- Tops
  WHEN name = 'T-Shirt' THEN 1500
  WHEN name = 'Shirt' THEN 2000
  WHEN name = 'Blouse' THEN 1800
  WHEN name = 'Sweater' THEN 2500
  -- Bottoms
  WHEN name = 'Pants' THEN 2000
  WHEN name = 'Shorts' THEN 1500
  WHEN name = 'Skirt' THEN 1800
  -- Dresses
  WHEN name = 'Dress' THEN 3000
  -- Outerwear
  WHEN name = 'Jacket' THEN 2500
  -- Bedding
  WHEN name = 'Bed Sheet' THEN 2000
  WHEN name = 'Blanket' THEN 4000
  ELSE price_tsh
END
WHERE service_type_id IN (SELECT id FROM service_types WHERE name = 'wash_fold');

-- Update Dry Cleaning items (premium service)
UPDATE service_items 
SET price_tsh = CASE 
  -- Tops
  WHEN name = 'Shirt' THEN 4000
  WHEN name = 'Blouse' THEN 3500
  WHEN name = 'Sweater' THEN 5000
  -- Bottoms
  WHEN name = 'Pants' THEN 4000
  WHEN name = 'Skirt' THEN 3500
  -- Dresses
  WHEN name = 'Dress' THEN 6000
  -- Outerwear
  WHEN name = 'Suit' THEN 10000
  WHEN name = 'Jacket' THEN 5000
  ELSE price_tsh
END
WHERE service_type_id IN (SELECT id FROM service_types WHERE name = 'dry_clean');

-- Update Iron Only items (most affordable)
UPDATE service_items 
SET price_tsh = CASE 
  -- Tops
  WHEN name = 'T-Shirt' THEN 800
  WHEN name = 'Shirt' THEN 1200
  WHEN name = 'Blouse' THEN 1000
  -- Bottoms
  WHEN name = 'Pants' THEN 1200
  WHEN name = 'Skirt' THEN 1000
  -- Dresses
  WHEN name = 'Dress' THEN 1800
  -- Outerwear
  WHEN name = 'Jacket' THEN 1500
  ELSE price_tsh
END
WHERE service_type_id IN (SELECT id FROM service_types WHERE name = 'iron');

-- Update service type base prices
UPDATE service_types 
SET base_price_tsh = CASE 
  WHEN name = 'wash_fold' THEN 5000
  WHEN name = 'dry_clean' THEN 8000
  WHEN name = 'iron' THEN 3000
  ELSE base_price_tsh
END;

-- Insert additional realistic items if they don't exist
INSERT INTO service_items (id, service_type_id, category_id, name, description, price_tsh, icon_name, is_active, created_at)
SELECT 
  uuid_generate_v4(),
  st.id,
  ic.id,
  'Jeans',
  'Denim jeans and pants',
  CASE 
    WHEN st.name = 'wash_fold' THEN 2500
    WHEN st.name = 'dry_clean' THEN 4500
    WHEN st.name = 'iron' THEN 1500
  END,
  'pants',
  true,
  NOW()
FROM service_types st, item_categories ic 
WHERE st.name = 'wash_fold' AND ic.name = 'bottoms'
AND NOT EXISTS (
  SELECT 1 FROM service_items si 
  WHERE si.service_type_id = st.id 
  AND si.category_id = ic.id 
  AND si.name = 'Jeans'
);

INSERT INTO service_items (id, service_type_id, category_id, name, description, price_tsh, icon_name, is_active, created_at)
SELECT 
  uuid_generate_v4(),
  st.id,
  ic.id,
  'Polo Shirt',
  'Polo shirts and collared t-shirts',
  CASE 
    WHEN st.name = 'wash_fold' THEN 1800
    WHEN st.name = 'dry_clean' THEN 3500
    WHEN st.name = 'iron' THEN 1000
  END,
  'shirt',
  true,
  NOW()
FROM service_types st, item_categories ic 
WHERE st.name = 'wash_fold' AND ic.name = 'tops'
AND NOT EXISTS (
  SELECT 1 FROM service_items si 
  WHERE si.service_type_id = st.id 
  AND si.category_id = ic.id 
  AND si.name = 'Polo Shirt'
);

INSERT INTO service_items (id, service_type_id, category_id, name, description, price_tsh, icon_name, is_active, created_at)
SELECT 
  uuid_generate_v4(),
  st.id,
  ic.id,
  'Hoodie',
  'Hooded sweatshirts and jackets',
  CASE 
    WHEN st.name = 'wash_fold' THEN 3000
    WHEN st.name = 'dry_clean' THEN 5500
    WHEN st.name = 'iron' THEN 1800
  END,
  'jacket',
  true,
  NOW()
FROM service_types st, item_categories ic 
WHERE st.name = 'wash_fold' AND ic.name = 'outerwear'
AND NOT EXISTS (
  SELECT 1 FROM service_items si 
  WHERE si.service_type_id = st.id 
  AND si.category_id = ic.id 
  AND si.name = 'Hoodie'
);

-- Add bedding items for wash & fold
INSERT INTO service_items (id, service_type_id, category_id, name, description, price_tsh, icon_name, is_active, created_at)
SELECT 
  uuid_generate_v4(),
  st.id,
  ic.id,
  'Pillowcase',
  'Bed pillowcases',
  CASE 
    WHEN st.name = 'wash_fold' THEN 1000
    WHEN st.name = 'dry_clean' THEN 2000
    WHEN st.name = 'iron' THEN 500
  END,
  'blanket',
  true,
  NOW()
FROM service_types st, item_categories ic 
WHERE st.name = 'wash_fold' AND ic.name = 'bedding'
AND NOT EXISTS (
  SELECT 1 FROM service_items si 
  WHERE si.service_type_id = st.id 
  AND si.category_id = ic.id 
  AND si.name = 'Pillowcase'
);

INSERT INTO service_items (id, service_type_id, category_id, name, description, price_tsh, icon_name, is_active, created_at)
SELECT 
  uuid_generate_v4(),
  st.id,
  ic.id,
  'Curtains',
  'Window curtains and drapes',
  CASE 
    WHEN st.name = 'wash_fold' THEN 5000
    WHEN st.name = 'dry_clean' THEN 8000
    WHEN st.name = 'iron' THEN 2500
  END,
  'blanket',
  true,
  NOW()
FROM service_types st, item_categories ic 
WHERE st.name = 'wash_fold' AND ic.name = 'bedding'
AND NOT EXISTS (
  SELECT 1 FROM service_items si 
  WHERE si.service_type_id = st.id 
  AND si.category_id = ic.id 
  AND si.name = 'Curtains'
); 