-- Manual Insert Script (Simpler Version)
-- Run this in your Supabase SQL editor

-- 1. Add service_type_id column to service_items
ALTER TABLE service_items 
ADD COLUMN IF NOT EXISTS service_type_id uuid REFERENCES service_types(id);

-- 2. Insert service types
INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at) 
VALUES 
(uuid_generate_v4(), 'wash_fold', 'Wash & Fold', 'Standard washing and folding service', 'wash_fold', 24, 2000, true, NOW()),
(uuid_generate_v4(), 'dry_clean', 'Dry Clean', 'Professional dry cleaning service', 'dry_clean', 48, 5000, true, NOW()),
(uuid_generate_v4(), 'iron', 'Iron Only', 'Professional ironing service', 'iron', 12, 1500, true, NOW())
ON CONFLICT (name) DO NOTHING;

-- 3. Insert item categories
INSERT INTO item_categories (id, name, display_name, icon_name, sort_order, is_active, created_at) 
VALUES 
(uuid_generate_v4(), 'tops', 'Tops', 'shirt', 1, true, NOW()),
(uuid_generate_v4(), 'bottoms', 'Bottoms', 'pants', 2, true, NOW()),
(uuid_generate_v4(), 'dresses', 'Dresses', 'dress', 3, true, NOW()),
(uuid_generate_v4(), 'outerwear', 'Outerwear', 'jacket', 4, true, NOW()),
(uuid_generate_v4(), 'bedding', 'Bedding', 'blanket', 5, true, NOW())
ON CONFLICT (name) DO NOTHING;

-- 4. Insert a few sample service items
INSERT INTO service_items (
    id, 
    service_type_id, 
    category_id, 
    name, 
    description, 
    price_tsh, 
    icon_name, 
    is_active, 
    created_at
) 
SELECT 
    uuid_generate_v4(),
    st.id,
    ic.id,
    'T-Shirt',
    'Cotton t-shirt',
    1000,
    'tshirt',
    true,
    NOW()
FROM service_types st, item_categories ic 
WHERE st.name = 'wash_fold' AND ic.name = 'tops'
ON CONFLICT DO NOTHING;

-- 5. Insert payment methods
INSERT INTO payment_methods (id, name, display_name, icon_name, is_active, created_at) VALUES
(uuid_generate_v4(), 'mpesa', 'M-Pesa', 'phone-portrait', true, NOW()),
(uuid_generate_v4(), 'airtel_money', 'Airtel Money', 'phone-portrait', true, NOW()),
(uuid_generate_v4(), 'cash', 'Cash', 'cash', true, NOW()),
(uuid_generate_v4(), 'card', 'Card', 'card', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- 6. Enable RLS
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- 7. Create policies
CREATE POLICY "Allow public read access to service_types" ON service_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access to item_categories" ON item_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to service_items" ON service_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to payment_methods" ON payment_methods FOR SELECT USING (true); 