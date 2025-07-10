-- Fix the pools RLS policy to allow invite-based access
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view pools they are members of" ON public.pools;

-- Create a new policy that allows viewing pools for members OR when accessing via invite
CREATE POLICY "Users can view pools they are members of or via invite" 
ON public.pools
FOR SELECT
TO authenticated
USING (
  -- Pool owner can always view
  owner_id = auth.uid() 
  OR 
  -- Pool members can view
  id IN (
    SELECT pool_memberships.pool_id
    FROM pool_memberships
    WHERE pool_memberships.user_id = auth.uid()
    AND pool_memberships.active = true
  )
  OR
  -- Allow viewing when invite_code exists (for join flow)
  (invite_code IS NOT NULL AND char_length(invite_code) = 8)
);