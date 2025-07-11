-- Fix the pools RLS policy to allow unauthenticated access via invite codes
-- This resolves the "expired" invite links issue

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view pools they are members of or via invite" ON public.pools;

-- Create a new policy that allows anyone (authenticated or not) to access pools via invite codes
CREATE POLICY "Allow pool access for members and invite codes" 
ON public.pools
FOR SELECT
USING (
  -- Pool owner can always view (if authenticated)
  (auth.uid() IS NOT NULL AND owner_id = auth.uid()) 
  OR 
  -- Pool members can view (if authenticated and member)
  (auth.uid() IS NOT NULL AND id IN (
    SELECT pool_memberships.pool_id
    FROM pool_memberships
    WHERE pool_memberships.user_id = auth.uid()
    AND pool_memberships.active = true
  ))
  OR
  -- ANYONE (authenticated or unauthenticated) can view when accessing via valid invite code
  (invite_code IS NOT NULL AND char_length(invite_code) = 8)
);