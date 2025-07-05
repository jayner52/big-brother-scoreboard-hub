-- Check the current RLS policy on pools table and fix it
-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'pools';

-- The issue might be that auth.uid() is not matching owner_id properly
-- Let's temporarily disable RLS to test, then create a better policy

-- Drop the existing policy
DROP POLICY IF EXISTS "Authenticated users can create pools" ON public.pools;

-- Create a more robust policy that handles potential auth issues
CREATE POLICY "Authenticated users can create pools" ON public.pools
  FOR INSERT 
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid()::text = owner_id::text
  );

-- Also ensure we can select our own pools
DROP POLICY IF EXISTS "Users can view pools they are members of" ON public.pools;

CREATE POLICY "Users can view pools they are members of" ON public.pools
  FOR SELECT 
  USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT pool_id FROM pool_memberships 
      WHERE user_id = auth.uid() AND active = true
    )
  );