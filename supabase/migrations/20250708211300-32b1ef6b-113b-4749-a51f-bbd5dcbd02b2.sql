-- Create user preferences table for email opt-in and terms tracking
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email_opt_in BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  terms_version VARCHAR(10) DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create email list table for managing subscribers
CREATE TABLE public.email_list (
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

-- Create admin users table for access control
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for email_list
CREATE POLICY "Users can view their own email subscription" ON public.email_list
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own email subscription" ON public.email_list
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all email subscriptions" ON public.email_list
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- RLS Policies for admin_users
CREATE POLICY "Admins can view admin list" ON public.admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() IN (SELECT user_id FROM public.admin_users));

-- Add updated_at trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();