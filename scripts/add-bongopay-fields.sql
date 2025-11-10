-- Add BongoPay-specific fields to payments table
-- This migration adds the necessary columns to fully support BongoPay integration

-- Add selcom_transaction_id column
ALTER TABLE payments ADD COLUMN IF NOT EXISTS selcom_transaction_id TEXT;

-- Add phone column for storing customer phone number
ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add created_at timestamp with default
ALTER TABLE payments ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add updated_at timestamp with default
ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add completed_at timestamp (nullable)
ALTER TABLE payments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create index on created_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Add comments to document the new columns
COMMENT ON COLUMN payments.selcom_transaction_id IS 'BongoPay Selcom transaction ID';
COMMENT ON COLUMN payments.phone IS 'Customer phone number used for payment';
COMMENT ON COLUMN payments.created_at IS 'Payment record creation timestamp';
COMMENT ON COLUMN payments.updated_at IS 'Payment record last update timestamp';
COMMENT ON COLUMN payments.completed_at IS 'Payment completion timestamp';

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'payments' 
ORDER BY ordinal_position; 