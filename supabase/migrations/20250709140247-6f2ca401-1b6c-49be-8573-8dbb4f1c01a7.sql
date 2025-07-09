-- Create a security definer function to check admin status without triggering RLS policies
CREATE OR REPLACE FUNCTION public.get_user_admin_status(target_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE user_id = target_user_id
  );
$$;

-- Drop the problematic circular RLS policy on admin_users
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;

-- Create a new policy that allows admins to view the admin list using the security definer function
CREATE POLICY "Admins can view admin list" 
ON public.admin_users 
FOR SELECT 
USING (public.get_user_admin_status(auth.uid()));

-- Update the user_feedback policy to use the security definer function
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.user_feedback;

CREATE POLICY "Admins can manage all feedback" 
ON public.user_feedback 
FOR ALL 
USING (public.get_user_admin_status(auth.uid()));

-- Also ensure regular users can still create feedback (this policy should remain unchanged)
-- The "Users can create feedback" policy allows anyone to insert, which is correct for feedback submission