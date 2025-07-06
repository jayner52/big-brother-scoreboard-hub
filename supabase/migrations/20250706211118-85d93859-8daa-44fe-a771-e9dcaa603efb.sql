-- Add enabled_special_events field to pools table for special events configuration
ALTER TABLE public.pools 
ADD COLUMN enabled_special_events TEXT[] DEFAULT '{}';

-- Add prize_mode field to support percentage vs custom prize distribution modes  
ALTER TABLE public.pools 
ADD COLUMN prize_mode TEXT DEFAULT 'percentage' CHECK (prize_mode IN ('percentage', 'custom'));

-- Update existing pools to have default special events enabled
UPDATE public.pools 
SET enabled_special_events = ARRAY[
  'won_secret_power', 
  'used_special_power', 
  'won_prize', 
  'received_penalty', 
  'came_back_evicted',
  'custom_event'
] 
WHERE enabled_special_events = '{}';

-- Add comment for documentation
COMMENT ON COLUMN public.pools.enabled_special_events IS 'Array of special event IDs that are enabled for this pool';
COMMENT ON COLUMN public.pools.prize_mode IS 'Prize distribution mode: percentage or custom amounts';