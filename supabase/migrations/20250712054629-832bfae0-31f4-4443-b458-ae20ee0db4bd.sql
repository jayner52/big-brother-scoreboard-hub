-- Phase 1: Add DM support to chat_messages table

-- Add new columns for DM functionality
ALTER TABLE public.chat_messages 
ADD COLUMN recipient_user_id uuid DEFAULT NULL,
ADD COLUMN chat_type text NOT NULL DEFAULT 'group' CHECK (chat_type IN ('group', 'direct'));

-- Update RLS policies for DM support
DROP POLICY IF EXISTS "Users can view messages in their pools" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can create messages in their pools" ON public.chat_messages;

-- New RLS policy for viewing messages (group + DMs)
CREATE POLICY "Users can view group messages in their pools and their DMs" 
ON public.chat_messages FOR SELECT 
USING (
  -- Group messages: user is in the pool
  (chat_type = 'group' AND pool_id IN (
    SELECT pool_memberships.pool_id
    FROM pool_memberships
    WHERE pool_memberships.user_id = auth.uid() 
    AND pool_memberships.active = true
  ))
  OR
  -- Direct messages: user is sender or recipient
  (chat_type = 'direct' AND (
    user_id = auth.uid() OR recipient_user_id = auth.uid()
  ))
);

-- New RLS policy for creating messages (group + DMs)
CREATE POLICY "Users can create group messages in their pools and DMs to pool members" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
  -- Must be authenticated and be the sender
  auth.uid() = user_id
  AND
  (
    -- Group messages: user is in the pool
    (chat_type = 'group' AND recipient_user_id IS NULL AND pool_id IN (
      SELECT pool_memberships.pool_id
      FROM pool_memberships
      WHERE pool_memberships.user_id = auth.uid() 
      AND pool_memberships.active = true
    ))
    OR
    -- Direct messages: both sender and recipient are in the same pool
    (chat_type = 'direct' AND recipient_user_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM pool_memberships pm1, pool_memberships pm2
      WHERE pm1.user_id = auth.uid() 
      AND pm2.user_id = chat_messages.recipient_user_id
      AND pm1.pool_id = pm2.pool_id 
      AND pm1.pool_id = chat_messages.pool_id
      AND pm1.active = true 
      AND pm2.active = true
    ))
  )
);

-- Add indexes for efficient DM queries
CREATE INDEX IF NOT EXISTS idx_chat_messages_dm_recipient ON public.chat_messages(recipient_user_id, pool_id) WHERE chat_type = 'direct';
CREATE INDEX IF NOT EXISTS idx_chat_messages_dm_sender ON public.chat_messages(user_id, pool_id) WHERE chat_type = 'direct';
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_type ON public.chat_messages(chat_type, pool_id);