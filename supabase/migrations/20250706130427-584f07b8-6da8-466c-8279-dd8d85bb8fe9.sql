-- Add pool-specific prize distribution to pools table
ALTER TABLE pools ADD COLUMN IF NOT EXISTS prize_distribution JSONB DEFAULT '{
  "first_place_percentage": 50,
  "second_place_percentage": 30,
  "third_place_percentage": 20,
  "first_place_amount": 0,
  "second_place_amount": 0,
  "third_place_amount": 0
}';

-- Add season completion tracking
ALTER TABLE pools ADD COLUMN IF NOT EXISTS season_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE pools ADD COLUMN IF NOT EXISTS draft_configuration_locked BOOLEAN DEFAULT FALSE;

-- Create winner tracking table
CREATE TABLE IF NOT EXISTS pool_winners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES pool_entries(id),
  place INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  payment_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for pool_winners
ALTER TABLE pool_winners ENABLE ROW LEVEL SECURITY;

-- Pool admins can manage winners
CREATE POLICY "Pool admins can manage winners"
ON pool_winners
FOR ALL
USING (
  pool_id IN (
    SELECT pool_id FROM pool_memberships 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND active = true
  )
);

-- Users can view winners in their pools
CREATE POLICY "Users can view winners in their pools"
ON pool_winners
FOR SELECT
USING (
  pool_id IN (
    SELECT pool_id FROM pool_memberships 
    WHERE user_id = auth.uid() 
    AND active = true
  )
);

-- Create winner payment details table
CREATE TABLE IF NOT EXISTS winner_payment_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  place INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  preferred_method TEXT NOT NULL,
  payment_info TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for winner_payment_details
ALTER TABLE winner_payment_details ENABLE ROW LEVEL SECURITY;

-- Users can manage their own payment details
CREATE POLICY "Users can manage their own payment details"
ON winner_payment_details
FOR ALL
USING (user_id = auth.uid());

-- Pool admins can view payment details
CREATE POLICY "Pool admins can view payment details"
ON winner_payment_details
FOR SELECT
USING (
  pool_id IN (
    SELECT pool_id FROM pool_memberships 
    WHERE user_id = auth.uid() 
    AND role IN ('owner', 'admin') 
    AND active = true
  )
);