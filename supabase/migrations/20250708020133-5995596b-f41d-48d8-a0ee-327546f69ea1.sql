-- Add missing columns to pool_winners table for enhanced prize management
ALTER TABLE public.pool_winners 
ADD COLUMN IF NOT EXISTS prize_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS prize_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS notes text;

-- Add team_id column if it doesn't exist  
ALTER TABLE public.pool_winners 
ADD COLUMN IF NOT EXISTS team_id uuid;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pool_winners_pool_id ON public.pool_winners(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_winners_user_id ON public.pool_winners(user_id);

-- Create notification system table for winner notifications
CREATE TABLE IF NOT EXISTS public.winner_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id uuid NOT NULL,
  user_id uuid NOT NULL,
  place integer NOT NULL,
  amount numeric NOT NULL,
  notification_type text NOT NULL, -- 'prize_won', 'payment_info_needed', 'prize_sent'
  message text,
  sent_at timestamp with time zone DEFAULT now(),
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on winner_notifications
ALTER TABLE public.winner_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for winner_notifications
CREATE POLICY "Users can view their own notifications"
ON public.winner_notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Pool admins can manage notifications"
ON public.winner_notifications
FOR ALL
USING (
  pool_id IN (
    SELECT pool_id FROM pool_memberships 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND active = true
  )
);

-- Create function to automatically notify winners when prizes are assigned
CREATE OR REPLACE FUNCTION public.notify_prize_winners()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert notification for the winner
  INSERT INTO public.winner_notifications (
    pool_id,
    user_id,
    place,
    amount,
    notification_type,
    message
  ) VALUES (
    NEW.pool_id,
    NEW.user_id,
    NEW.place,
    NEW.amount,
    'prize_won',
    'Congratulations! You finished in ' || 
    CASE 
      WHEN NEW.place = 1 THEN '1st place'
      WHEN NEW.place = 2 THEN '2nd place'
      WHEN NEW.place = 3 THEN '3rd place'
      ELSE NEW.place || 'th place'
    END || 
    ' and won $' || NEW.amount || '! Please submit your payment information.'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically notify winners
DROP TRIGGER IF EXISTS trigger_notify_prize_winners ON public.pool_winners;
CREATE TRIGGER trigger_notify_prize_winners
AFTER INSERT ON public.pool_winners
FOR EACH ROW
EXECUTE FUNCTION public.notify_prize_winners();