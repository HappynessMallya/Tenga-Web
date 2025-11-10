-- Fix Service Schema and Populate Data
-- This script works with your current database structure

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

-- First, let's add the missing service_type_id column to service_items
ALTER TABLE service_items 
ADD COLUMN service_type_id uuid REFERENCES service_types(id);

-- Insert service types
INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at) 
VALUES 
(uuid_generate_v4(), 'wash_fold', 'Wash & Fold', 'Standard washing and folding service', 'wash_fold', 24, 2000, true, NOW()),
(uuid_generate_v4(), 'dry_clean', 'Dry Clean', 'Professional dry cleaning service', 'dry_clean', 48, 5000, true, NOW()),
(uuid_generate_v4(), 'iron', 'Iron Only', 'Professional ironing service', 'iron', 12, 1500, true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert item categories
INSERT INTO item_categories (id, name, display_name, icon_name, sort_order, is_active, created_at) 
VALUES 
(uuid_generate_v4(), 'tops', 'Tops', 'shirt', 1, true, NOW()),
(uuid_generate_v4(), 'bottoms', 'Bottoms', 'pants', 2, true, NOW()),
(uuid_generate_v4(), 'dresses', 'Dresses', 'dress', 3, true, NOW()),
(uuid_generate_v4(), 'outerwear', 'Outerwear', 'jacket', 4, true, NOW()),
(uuid_generate_v4(), 'bedding', 'Bedding', 'blanket', 5, true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert service items with proper relationships
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
    v.name,
    v.description,
    v.price_tsh,
    v.icon_name,
    v.is_active,
    NOW()
FROM (
    VALUES 
    ('wash_fold', 'tops', 'T-Shirt', 'Cotton t-shirt', 1000, 'tshirt', true),
    ('wash_fold', 'tops', 'Shirt', 'Button-up shirt', 1500, 'shirt', true),
    ('wash_fold', 'tops', 'Blouse', 'Women''s blouse', 1200, 'blouse', true),
    ('wash_fold', 'tops', 'Sweater', 'Wool or cotton sweater', 2000, 'sweater', true),
    ('wash_fold', 'bottoms', 'Pants', 'Trousers or slacks', 1500, 'pants', true),
    ('wash_fold', 'bottoms', 'Shorts', 'Casual shorts', 1000, 'shorts', true),
    ('wash_fold', 'bottoms', 'Skirt', 'Women''s skirt', 1200, 'skirt', true),
    ('wash_fold', 'dresses', 'Dress', 'Casual or formal dress', 2500, 'dress', true),
    ('wash_fold', 'outerwear', 'Jacket', 'Light jacket or blazer', 2000, 'jacket', true),
    ('wash_fold', 'bedding', 'Bed Sheet', 'Single bed sheet', 1500, 'blanket', true),
    ('wash_fold', 'bedding', 'Blanket', 'Bed blanket', 3000, 'blanket', true),
    
    ('dry_clean', 'tops', 'Shirt', 'Button-up shirt (dry clean)', 3000, 'shirt', true),
    ('dry_clean', 'tops', 'Blouse', 'Women''s blouse (dry clean)', 2500, 'blouse', true),
    ('dry_clean', 'tops', 'Sweater', 'Wool sweater (dry clean)', 4000, 'sweater', true),
    ('dry_clean', 'bottoms', 'Pants', 'Trousers or slacks (dry clean)', 3000, 'pants', true),
    ('dry_clean', 'bottoms', 'Skirt', 'Women''s skirt (dry clean)', 2500, 'skirt', true),
    ('dry_clean', 'dresses', 'Dress', 'Formal dress (dry clean)', 5000, 'dress', true),
    ('dry_clean', 'outerwear', 'Suit', 'Business suit (dry clean)', 8000, 'suit', true),
    ('dry_clean', 'outerwear', 'Jacket', 'Blazer or jacket (dry clean)', 4000, 'jacket', true),
    
    ('iron', 'tops', 'T-Shirt', 'T-shirt ironing', 500, 'tshirt', true),
    ('iron', 'tops', 'Shirt', 'Shirt ironing', 800, 'shirt', true),
    ('iron', 'tops', 'Blouse', 'Blouse ironing', 700, 'blouse', true),
    ('iron', 'bottoms', 'Pants', 'Pants ironing', 800, 'pants', true),
    ('iron', 'bottoms', 'Skirt', 'Skirt ironing', 700, 'skirt', true),
    ('iron', 'dresses', 'Dress', 'Dress ironing', 1200, 'dress', true),
    ('iron', 'outerwear', 'Jacket', 'Jacket ironing', 1000, 'jacket', true)
) AS v(service_type_name, item_category_name, name, description, price_tsh, icon_name, is_active)
JOIN service_types st ON st.name = v.service_type_name
JOIN item_categories ic ON ic.name = v.item_category_name
ON CONFLICT DO NOTHING;

-- Create time_slots table first
CREATE TABLE IF NOT EXISTS time_slots (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert time slots
INSERT INTO time_slots (id, day_of_week, start_time, end_time, is_active, created_at, updated_at) VALUES
(1, 1, '07:00:00', '09:00:00', true, NOW(), NOW()), -- Monday morning
(2, 1, '17:00:00', '19:00:00', true, NOW(), NOW()), -- Monday evening
(3, 2, '07:00:00', '09:00:00', true, NOW(), NOW()), -- Tuesday morning
(4, 2, '17:00:00', '19:00:00', true, NOW(), NOW()), -- Tuesday evening
(5, 3, '07:00:00', '09:00:00', true, NOW(), NOW()), -- Wednesday morning
(6, 3, '17:00:00', '19:00:00', true, NOW(), NOW()), -- Wednesday evening
(7, 4, '07:00:00', '09:00:00', true, NOW(), NOW()), -- Thursday morning
(8, 4, '17:00:00', '19:00:00', true, NOW(), NOW()), -- Thursday evening
(9, 5, '07:00:00', '09:00:00', true, NOW(), NOW()), -- Friday morning
(10, 5, '17:00:00', '19:00:00', true, NOW(), NOW()), -- Friday evening
(11, 6, '09:00:00', '11:00:00', true, NOW(), NOW()), -- Saturday morning
(12, 6, '14:00:00', '16:00:00', true, NOW(), NOW()), -- Saturday afternoon
(13, 0, '10:00:00', '12:00:00', true, NOW(), NOW()), -- Sunday morning
(14, 0, '15:00:00', '17:00:00', true, NOW(), NOW()) -- Sunday afternoon
ON CONFLICT (id) DO NOTHING;

-- Insert payment methods
INSERT INTO payment_methods (id, name, display_name, icon_name, is_active, created_at) VALUES
(uuid_generate_v4(), 'mpesa', 'M-Pesa', 'phone-portrait', true, NOW()),
(uuid_generate_v4(), 'airtel_money', 'Airtel Money', 'phone-portrait', true, NOW()),
(uuid_generate_v4(), 'cash', 'Cash', 'cash', true, NOW()),
(uuid_generate_v4(), 'card', 'Card', 'card', true, NOW())
ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to service_types" ON service_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access to item_categories" ON item_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to service_items" ON service_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to payment_methods" ON payment_methods FOR SELECT USING (true);

-- Enable RLS for time_slots
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to time_slots" ON time_slots FOR SELECT USING (true); 