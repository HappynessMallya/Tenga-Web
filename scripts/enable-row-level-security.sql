-- Enable Row Level Security for all tables
-- This prevents unauthorized access to data at the database level

-- Users table - users can only see their own data
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Orders table - customers see their orders, vendors see assigned orders, delivery agents see assigned
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = orders.customer_id 
      AND customers.user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors can view assigned orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = orders.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

CREATE POLICY "Delivery agents can view assigned orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM delivery_agents 
      WHERE delivery_agents.id = orders.delivery_agent_id 
      AND delivery_agents.user_id = auth.uid()
    )
  );

-- Notifications table - users can only see their own notifications  
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Order items - inherit access from orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view order items for accessible orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id
      -- Orders policy will handle the access control
    )
  );

-- Reviews - customers can create, vendors can view
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can create reviews for own orders" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.id = reviews.order_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

-- Vendor earnings - only accessible by the vendor
ALTER TABLE vendor_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view own earnings" ON vendor_earnings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = vendor_earnings.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Service areas - vendors can manage their own
ALTER TABLE service_areas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own service areas" ON service_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM vendors 
      WHERE vendors.id = service_areas.vendor_id 
      AND vendors.user_id = auth.uid()
    )
  );

-- Read-only tables (categories, garment items) - public read access
ALTER TABLE garment_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view garment categories" ON garment_categories
  FOR SELECT USING (is_active = true);

ALTER TABLE garment_items ENABLE ROW LEVEL SECURITY;  
CREATE POLICY "Anyone can view active garment items" ON garment_items
  FOR SELECT USING (is_active = true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON notifications TO authenticated;
GRANT SELECT ON order_items TO authenticated;
GRANT SELECT, INSERT ON reviews TO authenticated;
GRANT SELECT ON vendor_earnings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON service_areas TO authenticated;
GRANT SELECT ON garment_categories TO authenticated;
GRANT SELECT ON garment_items TO authenticated;

-- Enable real-time for tables that need it
ALTER publication supabase_realtime ADD TABLE orders;
ALTER publication supabase_realtime ADD TABLE notifications;
ALTER publication supabase_realtime ADD TABLE order_items; 