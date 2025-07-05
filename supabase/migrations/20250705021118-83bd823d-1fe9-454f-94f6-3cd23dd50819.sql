-- Drop the existing policy that depends on is_public column
DROP POLICY IF EXISTS "Users can view pools they are members of" ON public.pools;

-- Remove is_public column from pools table since all pools are now invite-only
ALTER TABLE public.pools DROP COLUMN IF EXISTS is_public;

-- Create new policy without is_public logic
CREATE POLICY "Users can view pools they are members of"
ON public.pools
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT pool_memberships.pool_id
    FROM pool_memberships
    WHERE pool_memberships.user_id = auth.uid()
    AND pool_memberships.active = true
  )
);