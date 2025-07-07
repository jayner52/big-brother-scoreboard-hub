-- Enhance prize structure to support unlimited custom prizes
-- Add flexible prize configuration support

-- Update pools table to support new prize structure format
ALTER TABLE public.pools 
ADD COLUMN IF NOT EXISTS prize_configuration jsonb DEFAULT '{
  "mode": "percentage",
  "admin_fee": 0,
  "percentage_distribution": {
    "first_place_percentage": 50,
    "second_place_percentage": 30,
    "third_place_percentage": 20,
    "fourth_place_percentage": 0,
    "fifth_place_percentage": 0
  },
  "custom_prizes": [
    {"id": "1", "place": 1, "amount": 0, "description": "1st Place"},
    {"id": "2", "place": 2, "amount": 0, "description": "2nd Place"},
    {"id": "3", "place": 3, "amount": 0, "description": "3rd Place"}
  ]
}'::jsonb;

-- Create index for better performance on prize configuration queries
CREATE INDEX IF NOT EXISTS idx_pools_prize_configuration 
ON public.pools USING GIN (prize_configuration);

-- Add comment for documentation
COMMENT ON COLUMN public.pools.prize_configuration IS 'Flexible prize structure supporting unlimited custom prizes with percentage or fixed amount distribution modes';