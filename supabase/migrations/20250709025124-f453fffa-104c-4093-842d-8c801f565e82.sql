
-- Fix RLS policy on contestant_groups to allow global defaults (pool_id IS NULL)
-- This allows system operations to create global Season 27 defaults while preserving pool admin security

DROP POLICY IF EXISTS "Pool admins can manage contestant groups" ON public.contestant_groups;

CREATE POLICY "Pool admins can manage contestant groups" ON public.contestant_groups
  FOR ALL
  USING ((pool_id IS NULL) OR get_user_pool_admin_status(pool_id))
  WITH CHECK ((pool_id IS NULL) OR get_user_pool_admin_status(pool_id));

-- Also update the contestants table RLS policy to allow global defaults
DROP POLICY IF EXISTS "Pool admins can manage contestants" ON public.contestants;

CREATE POLICY "Pool admins can manage contestants" ON public.contestants
  FOR ALL
  USING ((pool_id IS NULL) OR get_user_pool_admin_status(pool_id))
  WITH CHECK ((pool_id IS NULL) OR get_user_pool_admin_status(pool_id));
