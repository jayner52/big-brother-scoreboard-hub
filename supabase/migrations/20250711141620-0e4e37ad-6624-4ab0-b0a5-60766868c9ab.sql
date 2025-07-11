-- Add soft delete columns to pool_entries table
ALTER TABLE public.pool_entries 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN deleted_by_user BOOLEAN DEFAULT FALSE;

-- Create index for better performance on deleted entries queries
CREATE INDEX idx_pool_entries_deleted_at ON public.pool_entries(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX idx_pool_entries_deleted_by_user ON public.pool_entries(deleted_by_user) WHERE deleted_by_user = true;