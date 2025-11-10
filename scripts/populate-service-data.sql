-- Populate Service Types
INSERT INTO service_types (id, name, display_name, description, icon_name, processing_time_hours, base_price_tsh, is_active, created_at, updated_at) VALUES
('st_001', 'wash_fold', 'Wash & Fold', 'Standard washing and folding service', 'wash_fold', 24, 2000, true, NOW(), NOW()),
('st_002', 'dry_clean', 'Dry Clean', 'Professional dry cleaning service', 'dry_clean', 48, 5000, true, NOW(), NOW()),
('st_003', 'iron', 'Iron Only', 'Professional ironing service', 'iron', 12, 1500, true, NOW(), NOW());

-- Populate Item Categories
INSERT INTO item_categories (id, name, display_name, description, icon_name, sort_order, is_active, created_at, updated_at) VALUES
('ic_001', 'tops', 'Tops', 'Shirts, t-shirts, blouses, and other upper body garments', 'shirt', 1, true, NOW(), NOW()),
('ic_002', 'bottoms', 'Bottoms', 'Pants, skirts, shorts, and other lower body garments', 'pants', 2, true, NOW(), NOW()),
('ic_003', 'dresses', 'Dresses', 'Dresses, gowns, and one-piece garments', 'dress', 3, true, NOW(), NOW()),
('ic_004', 'outerwear', 'Outerwear', 'Jackets, coats, sweaters, and other outer garments', 'jacket', 4, true, NOW(), NOW()),
('ic_005', 'bedding', 'Bedding', 'Bed sheets, blankets, pillowcases, and other bedding items', 'blanket', 5, true, NOW(), NOW());

-- Populate Service Items for Wash & Fold
INSERT INTO service_items (id, service_type_id, item_category_id, name, description, price_tsh, icon_name, is_active, created_at, updated_at) VALUES
-- Tops
('si_001', 'st_001', 'ic_001', 'T-Shirt', 'Cotton t-shirt', 1000, 'tshirt', true, NOW(), NOW()),
('si_002', 'st_001', 'ic_001', 'Shirt', 'Button-up shirt', 1500, 'shirt', true, NOW(), NOW()),
('si_003', 'st_001', 'ic_001', 'Blouse', 'Women\'s blouse', 1200, 'blouse', true, NOW(), NOW()),
('si_004', 'st_001', 'ic_001', 'Sweater', 'Wool or cotton sweater', 2000, 'sweater', true, NOW(), NOW()),

-- Bottoms
('si_005', 'st_001', 'ic_002', 'Pants', 'Trousers or slacks', 1500, 'pants', true, NOW(), NOW()),
('si_006', 'st_001', 'ic_002', 'Shorts', 'Casual shorts', 1000, 'shorts', true, NOW(), NOW()),
('si_007', 'st_001', 'ic_002', 'Skirt', 'Women\'s skirt', 1200, 'skirt', true, NOW(), NOW()),

-- Dresses
('si_008', 'st_001', 'ic_003', 'Dress', 'Casual or formal dress', 2500, 'dress', true, NOW(), NOW()),

-- Outerwear
('si_009', 'st_001', 'ic_004', 'Jacket', 'Light jacket or blazer', 2000, 'jacket', true, NOW(), NOW()),

-- Bedding
('si_010', 'st_001', 'ic_005', 'Bed Sheet', 'Single bed sheet', 1500, 'blanket', true, NOW(), NOW()),
('si_011', 'st_001', 'ic_005', 'Blanket', 'Bed blanket', 3000, 'blanket', true, NOW(), NOW());

-- Populate Service Items for Dry Clean
INSERT INTO service_items (id, service_type_id, item_category_id, name, description, price_tsh, icon_name, is_active, created_at, updated_at) VALUES
-- Tops
('si_012', 'st_002', 'ic_001', 'Shirt', 'Button-up shirt (dry clean)', 3000, 'shirt', true, NOW(), NOW()),
('si_013', 'st_002', 'ic_001', 'Blouse', 'Women\'s blouse (dry clean)', 2500, 'blouse', true, NOW(), NOW()),
('si_014', 'st_002', 'ic_001', 'Sweater', 'Wool sweater (dry clean)', 4000, 'sweater', true, NOW(), NOW()),

-- Bottoms
('si_015', 'st_002', 'ic_002', 'Pants', 'Trousers or slacks (dry clean)', 3000, 'pants', true, NOW(), NOW()),
('si_016', 'st_002', 'ic_002', 'Skirt', 'Women\'s skirt (dry clean)', 2500, 'skirt', true, NOW(), NOW()),

-- Dresses
('si_017', 'st_002', 'ic_003', 'Dress', 'Formal dress (dry clean)', 5000, 'dress', true, NOW(), NOW()),

-- Outerwear
('si_018', 'st_002', 'ic_004', 'Suit', 'Business suit (dry clean)', 8000, 'suit', true, NOW(), NOW()),
('si_019', 'st_002', 'ic_004', 'Jacket', 'Blazer or jacket (dry clean)', 4000, 'jacket', true, NOW(), NOW());

-- Populate Service Items for Iron Only
INSERT INTO service_items (id, service_type_id, item_category_id, name, description, price_tsh, icon_name, is_active, created_at, updated_at) VALUES
-- Tops
('si_020', 'st_003', 'ic_001', 'T-Shirt', 'T-shirt ironing', 500, 'tshirt', true, NOW(), NOW()),
('si_021', 'st_003', 'ic_001', 'Shirt', 'Shirt ironing', 800, 'shirt', true, NOW(), NOW()),
('si_022', 'st_003', 'ic_001', 'Blouse', 'Blouse ironing', 700, 'blouse', true, NOW(), NOW()),

-- Bottoms
('si_023', 'st_003', 'ic_002', 'Pants', 'Pants ironing', 800, 'pants', true, NOW(), NOW()),
('si_024', 'st_003', 'ic_002', 'Skirt', 'Skirt ironing', 700, 'skirt', true, NOW(), NOW()),

-- Dresses
('si_025', 'st_003', 'ic_003', 'Dress', 'Dress ironing', 1200, 'dress', true, NOW(), NOW()),

-- Outerwear
('si_026', 'st_003', 'ic_004', 'Jacket', 'Jacket ironing', 1000, 'jacket', true, NOW(), NOW());

-- Populate Time Slots
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
(14, 0, '15:00:00', '17:00:00', true, NOW(), NOW()); -- Sunday afternoon

-- Populate Payment Methods
INSERT INTO payment_methods (id, name, display_name, description, icon_name, is_active, created_at, updated_at) VALUES
('pm_001', 'mpesa', 'M-Pesa', 'Mobile money payment via M-Pesa', 'phone-portrait', true, NOW(), NOW()),
('pm_002', 'airtel_money', 'Airtel Money', 'Mobile money payment via Airtel Money', 'phone-portrait', true, NOW(), NOW()),
('pm_003', 'cash', 'Cash', 'Cash payment on delivery', 'cash', true, NOW(), NOW()),
('pm_004', 'card', 'Card', 'Credit or debit card payment', 'card', true, NOW(), NOW());

-- Enable Row Level Security
ALTER TABLE service_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to service_types" ON service_types FOR SELECT USING (true);
CREATE POLICY "Allow public read access to item_categories" ON item_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to service_items" ON service_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to time_slots" ON time_slots FOR SELECT USING (true);
CREATE POLICY "Allow public read access to payment_methods" ON payment_methods FOR SELECT USING (true); 