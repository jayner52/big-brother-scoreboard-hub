-- Create chat system tables
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  mentioned_user_ids UUID[] DEFAULT '{}',
  parent_message_id UUID REFERENCES public.chat_messages(id),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat read status table for tracking unread messages
CREATE TABLE public.chat_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  pool_id UUID NOT NULL REFERENCES public.pools(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  unread_count INTEGER DEFAULT 0,
  unread_mentions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, pool_id)
);

-- Create indexes for performance
CREATE INDEX idx_chat_messages_pool_created ON public.chat_messages(pool_id, created_at DESC);
CREATE INDEX idx_chat_messages_user ON public.chat_messages(user_id);
CREATE INDEX idx_chat_read_status_user_pool ON public.chat_read_status(user_id, pool_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_read_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their pools" 
ON public.chat_messages FOR SELECT 
USING (
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Users can create messages in their pools" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  pool_id IN (
    SELECT pool_id FROM public.pool_memberships 
    WHERE user_id = auth.uid() AND active = true
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for chat_read_status
CREATE POLICY "Users can view their own read status" 
ON public.chat_read_status FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own read status" 
ON public.chat_read_status FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger for chat_messages
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for chat_read_status  
CREATE TRIGGER update_chat_read_status_updated_at
  BEFORE UPDATE ON public.chat_read_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();