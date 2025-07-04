-- Fix infinite recursion in pool_memberships RLS policies
-- Drop the problematic policy that causes recursion
DROP POLICY IF EXISTS "Pool admins can manage memberships" ON public.pool_memberships;
DROP POLICY IF EXISTS "Users can view memberships in their pools" ON public.pool_memberships;

-- Create a security definer function to get user's pool admin status
CREATE OR REPLACE FUNCTION public.get_user_pool_admin_status(target_pool_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.pool_memberships
    WHERE pool_id = target_pool_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
    AND active = true
  );
$$;

-- Create new policies using the security definer function
CREATE POLICY "Pool admins can manage memberships" 
ON public.pool_memberships
FOR ALL
USING (public.get_user_pool_admin_status(pool_id))
WITH CHECK (public.get_user_pool_admin_status(pool_id));

CREATE POLICY "Users can view their own memberships" 
ON public.pool_memberships
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can view memberships in pools they admin" 
ON public.pool_memberships
FOR SELECT
USING (public.get_user_pool_admin_status(pool_id));