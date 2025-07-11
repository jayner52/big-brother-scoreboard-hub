-- Create pool notifications table for member notifications when pools are deleted
CREATE TABLE public.pool_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id uuid NOT NULL,
  user_id uuid NOT NULL,
  notification_type text NOT NULL, -- 'pool_deleted', 'refund_info'
  message text,
  pool_name text NOT NULL,
  amount_paid numeric DEFAULT 0,
  deleted_by_admin text,
  sent_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on pool notifications
ALTER TABLE public.pool_notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON public.pool_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications" 
ON public.pool_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can create notifications for pool members
CREATE POLICY "System can create notifications" 
ON public.pool_notifications 
FOR INSERT 
WITH CHECK (true);

-- Add index for better query performance
CREATE INDEX idx_pool_notifications_user_id ON public.pool_notifications(user_id);
CREATE INDEX idx_pool_notifications_read_at ON public.pool_notifications(read_at) WHERE read_at IS NULL;