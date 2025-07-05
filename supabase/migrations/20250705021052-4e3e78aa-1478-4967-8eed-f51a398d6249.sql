-- Remove is_public column from pools table since all pools are now invite-only
ALTER TABLE public.pools DROP COLUMN IF EXISTS is_public;

-- Update pools RLS policy to remove public pool logic
DROP POLICY IF EXISTS "Users can view pools they are members of" ON public.pools;

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