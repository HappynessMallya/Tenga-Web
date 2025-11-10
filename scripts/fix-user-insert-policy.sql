-- Fix RLS policy for users table to allow INSERT during OAuth registration
-- This adds a missing INSERT policy that was causing database timeouts

-- Add INSERT policy for users table
CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also ensure authenticated users can INSERT
GRANT INSERT ON users TO authenticated;

-- Verify the policy exists
SELECT * FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow user registration'; 