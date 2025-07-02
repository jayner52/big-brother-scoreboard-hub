-- Add delete policy for pool_entries (admin functionality)
CREATE POLICY "Admins can delete pool entries" 
ON public.pool_entries 
FOR DELETE 
USING (true);

-- Add draft lock functionality to pool_settings  
ALTER TABLE public.pool_settings 
ADD COLUMN draft_locked boolean NOT NULL DEFAULT false;