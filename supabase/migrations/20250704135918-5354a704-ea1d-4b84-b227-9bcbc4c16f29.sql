-- Phase 1: Create multi-pool database schema

-- Create pools table
CREATE TABLE public.pools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Pool-specific settings (moved from global pool_settings)
  entry_fee_amount NUMERIC NOT NULL DEFAULT 25.00,
  entry_fee_currency TEXT NOT NULL DEFAULT 'CAD',
  payment_method_1 TEXT NOT NULL DEFAULT 'E-transfer',
  payment_details_1 TEXT NOT NULL DEFAULT 'email@example.com',
  payment_method_2 TEXT,
  payment_details_2 TEXT,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  draft_open BOOLEAN NOT NULL DEFAULT true,
  draft_locked BOOLEAN NOT NULL DEFAULT false,
  enable_bonus_questions BOOLEAN NOT NULL DEFAULT true,
  picks_per_team INTEGER NOT NULL DEFAULT 5,
  jury_phase_started BOOLEAN NOT NULL DEFAULT false,
  jury_start_week INTEGER,
  jury_start_timestamp TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT pools_name_owner_unique UNIQUE (name, owner_id)
);

-- Create pool memberships table
CREATE TABLE public.pool_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT pool_memberships_user_pool_unique UNIQUE (user_id, pool_id)
);

-- Create pool invites table
CREATE TABLE public.pool_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL,
  invite_code TEXT NOT NULL,
  email TEXT,
  used BOOLEAN NOT NULL DEFAULT false,
  used_by UUID,
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT pool_invites_code_unique UNIQUE (invite_code)
);

-- Add pool_id to existing tables
ALTER TABLE public.pool_entries 
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

ALTER TABLE public.weekly_team_snapshots 
ADD COLUMN pool_id UUID REFERENCES public.pools(id) ON DELETE CASCADE;

-- Create default pool and migrate existing data
INSERT INTO public.pools (
  id,
  owner_id,
  name,
  description,
  invite_code,
  is_public,
  entry_fee_amount,
  entry_fee_currency,
  payment_method_1,
  payment_details_1,
  payment_method_2,
  payment_details_2,
  registration_deadline,
  draft_open,
  draft_locked,
  enable_bonus_questions,
  picks_per_team,
  jury_phase_started,
  jury_start_week,
  jury_start_timestamp
)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM auth.users LIMIT 1), -- Assign to first user as temporary owner
  ps.season_name,
  'Default pool migrated from original system',
  'LEGACY01',
  true,
  ps.entry_fee_amount,
  ps.entry_fee_currency,
  ps.payment_method_1,
  ps.payment_details_1,
  ps.payment_method_2,
  ps.payment_details_2,
  ps.registration_deadline,
  ps.draft_open,
  ps.draft_locked,
  ps.enable_bonus_questions,
  ps.picks_per_team,
  ps.jury_phase_started,
  ps.jury_start_week,
  ps.jury_start_timestamp
FROM public.pool_settings ps
LIMIT 1;

-- Update existing pool entries to reference the default pool
UPDATE public.pool_entries 
SET pool_id = (SELECT id FROM public.pools WHERE invite_code = 'LEGACY01' LIMIT 1)
WHERE pool_id IS NULL;

-- Update existing snapshots to reference the default pool  
UPDATE public.weekly_team_snapshots 
SET pool_id = (SELECT id FROM public.pools WHERE invite_code = 'LEGACY01' LIMIT 1)
WHERE pool_id IS NULL;

-- Create memberships for all existing users in the default pool
INSERT INTO public.pool_memberships (user_id, pool_id, role)
SELECT DISTINCT 
  pe.user_id,
  (SELECT id FROM public.pools WHERE invite_code = 'LEGACY01' LIMIT 1),
  'member'
FROM public.pool_entries pe
WHERE pe.user_id IS NOT NULL
ON CONFLICT (user_id, pool_id) DO NOTHING;

-- Make pool_id required after migration
ALTER TABLE public.pool_entries ALTER COLUMN pool_id SET NOT NULL;
ALTER TABLE public.weekly_team_snapshots ALTER COLUMN pool_id SET NOT NULL;

-- Enable RLS on new tables
ALTER TABLE public.pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pool_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for pools
CREATE POLICY "Users can view pools they are members of" 
ON public.pools FOR SELECT 
USING (
  id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND active = true
  ) OR is_public = true
);

CREATE POLICY "Pool owners can update their pools" 
ON public.pools FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Authenticated users can create pools" 
ON public.pools FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Pool owners can delete their pools" 
ON public.pools FOR DELETE 
USING (owner_id = auth.uid());

-- RLS Policies for pool memberships
CREATE POLICY "Users can view memberships in their pools" 
ON public.pool_memberships FOR SELECT 
USING (
  user_id = auth.uid() OR 
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Pool admins can manage memberships" 
ON public.pool_memberships FOR ALL 
USING (
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Users can join pools via invites" 
ON public.pool_memberships FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- RLS Policies for pool invites
CREATE POLICY "Pool admins can manage invites" 
ON public.pool_invites FOR ALL 
USING (
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Update existing RLS policies for pool_entries to include pool isolation
DROP POLICY IF EXISTS "Users can view all pool entries" ON public.pool_entries;
DROP POLICY IF EXISTS "Users can create their own pool entry" ON public.pool_entries;
DROP POLICY IF EXISTS "Users can update their own pool entry" ON public.pool_entries;

CREATE POLICY "Users can view entries in their pools" 
ON public.pool_entries FOR SELECT 
USING (
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Users can create entries in pools they belong to" 
ON public.pool_entries FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Users can update their own entries" 
ON public.pool_entries FOR UPDATE 
USING (auth.uid() = user_id);

-- Update RLS for weekly_team_snapshots
DROP POLICY IF EXISTS "Everyone can view weekly snapshots" ON public.weekly_team_snapshots;

CREATE POLICY "Users can view snapshots in their pools" 
ON public.weekly_team_snapshots FOR SELECT 
USING (
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND active = true
  )
);

-- Create functions for pool management
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    
    SELECT EXISTS(
      SELECT 1 FROM public.pools WHERE invite_code = new_code
      UNION ALL
      SELECT 1 FROM public.pool_invites WHERE invite_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create function to join pool via invite code
CREATE OR REPLACE FUNCTION public.join_pool_by_invite(invite_code_param TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  pool_record RECORD;
  invite_record RECORD;
  current_user_id UUID;
  result JSONB;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  -- Check if it's a pool invite code
  SELECT * INTO pool_record FROM public.pools WHERE invite_code = invite_code_param;
  
  IF pool_record.id IS NOT NULL THEN
    -- Insert membership
    INSERT INTO public.pool_memberships (user_id, pool_id, role)
    VALUES (current_user_id, pool_record.id, 'member')
    ON CONFLICT (user_id, pool_id) DO UPDATE SET active = true;
    
    RETURN jsonb_build_object('success', true, 'pool_id', pool_record.id, 'pool_name', pool_record.name);
  END IF;
  
  -- Check if it's an invite code from pool_invites
  SELECT pi.*, p.name as pool_name INTO invite_record 
  FROM public.pool_invites pi
  JOIN public.pools p ON pi.pool_id = p.id
  WHERE pi.invite_code = invite_code_param 
    AND pi.used = false 
    AND pi.expires_at > now();
  
  IF invite_record.id IS NOT NULL THEN
    -- Mark invite as used
    UPDATE public.pool_invites 
    SET used = true, used_by = current_user_id, used_at = now()
    WHERE id = invite_record.id;
    
    -- Insert membership
    INSERT INTO public.pool_memberships (user_id, pool_id, role)
    VALUES (current_user_id, invite_record.pool_id, 'member')
    ON CONFLICT (user_id, pool_id) DO UPDATE SET active = true;
    
    RETURN jsonb_build_object('success', true, 'pool_id', invite_record.pool_id, 'pool_name', invite_record.pool_name);
  END IF;
  
  RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invite code');
END;
$$;

-- Create updated trigger for pools
CREATE TRIGGER update_pools_updated_at
  BEFORE UPDATE ON public.pools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();