-- Create email list table for managing subscribers (if not exists)
CREATE TABLE IF NOT EXISTS public.email_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'active',
  source VARCHAR(50) DEFAULT 'signup',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create admin users table for access control (if not exists)
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Update user_preferences table to add missing columns if needed
DO $$
BEGIN
  -- Add email_opt_in column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'email_opt_in') THEN
    ALTER TABLE public.user_preferences ADD COLUMN email_opt_in BOOLEAN DEFAULT false;
  END IF;
  
  -- Add terms_accepted_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'terms_accepted_at') THEN
    ALTER TABLE public.user_preferences ADD COLUMN terms_accepted_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add terms_version column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_preferences' AND column_name = 'terms_version') THEN
    ALTER TABLE public.user_preferences ADD COLUMN terms_version VARCHAR(10) DEFAULT '1.0';
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.email_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_list
DROP POLICY IF EXISTS "Users can view their own email subscription" ON public.email_list;
CREATE POLICY "Users can view their own email subscription" ON public.email_list
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own email subscription" ON public.email_list;
CREATE POLICY "Users can manage their own email subscription" ON public.email_list
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all email subscriptions" ON public.email_list;
CREATE POLICY "Admins can view all email subscriptions" ON public.email_list
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- RLS Policies for admin_users
DROP POLICY IF EXISTS "Admins can view admin list" ON public.admin_users;
CREATE POLICY "Admins can view admin list" ON public.admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));