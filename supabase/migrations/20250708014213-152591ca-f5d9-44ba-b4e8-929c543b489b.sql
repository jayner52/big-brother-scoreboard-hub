-- Create table for manual checklist task completion overrides
CREATE TABLE public.pool_checklist_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE,
  task_id TEXT NOT NULL,
  manually_completed BOOLEAN DEFAULT false,
  completed_by UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pool_id, task_id)
);

-- Enable RLS
ALTER TABLE public.pool_checklist_overrides ENABLE ROW LEVEL SECURITY;

-- Allow pool admins to manage checklist overrides
CREATE POLICY "Pool admins can manage checklist overrides"
ON public.pool_checklist_overrides
FOR ALL
USING (get_user_pool_admin_status(pool_id))
WITH CHECK (get_user_pool_admin_status(pool_id));

-- Allow users to view checklist overrides in their pools
CREATE POLICY "Users can view checklist overrides in their pools"
ON public.pool_checklist_overrides
FOR SELECT
USING (pool_id IN (
  SELECT pool_id FROM public.pool_memberships 
  WHERE user_id = auth.uid() AND active = true
));

-- Add updated_at trigger
CREATE TRIGGER update_pool_checklist_overrides_updated_at
BEFORE UPDATE ON public.pool_checklist_overrides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();