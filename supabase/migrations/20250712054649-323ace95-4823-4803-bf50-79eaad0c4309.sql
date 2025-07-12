-- Update chat_read_status table to support DM tracking
ALTER TABLE public.chat_read_status 
ADD COLUMN chat_type text DEFAULT 'group' CHECK (chat_type IN ('group', 'direct')),
ADD COLUMN other_user_id uuid DEFAULT NULL;

-- Drop existing unique constraint and create new one that includes chat_type and other_user_id
ALTER TABLE public.chat_read_status DROP CONSTRAINT IF EXISTS chat_read_status_user_id_pool_id_key;
CREATE UNIQUE INDEX chat_read_status_unique_idx ON public.chat_read_status(user_id, pool_id, chat_type, COALESCE(other_user_id, '00000000-0000-0000-0000-000000000000'::uuid));

-- Update RLS policies for chat_read_status to handle DMs
DROP POLICY IF EXISTS "Users can manage their own read status" ON public.chat_read_status;
CREATE POLICY "Users can manage their own read status including DMs" 
ON public.chat_read_status FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update the increment_unread_counts function to handle DMs
CREATE OR REPLACE FUNCTION public.increment_unread_counts(
  target_user_id uuid, 
  target_pool_id uuid, 
  is_mention boolean DEFAULT false,
  target_chat_type text DEFAULT 'group',
  target_other_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Insert or update read status for group chats or DMs
  INSERT INTO public.chat_read_status (
    user_id, 
    pool_id, 
    unread_count, 
    unread_mentions,
    chat_type,
    other_user_id
  )
  VALUES (
    target_user_id, 
    target_pool_id, 
    1, 
    CASE WHEN is_mention THEN 1 ELSE 0 END,
    target_chat_type,
    target_other_user_id
  )
  ON CONFLICT (user_id, pool_id, chat_type, COALESCE(other_user_id, '00000000-0000-0000-0000-000000000000'::uuid))
  DO UPDATE SET
    unread_count = chat_read_status.unread_count + 1,
    unread_mentions = chat_read_status.unread_mentions + CASE WHEN is_mention THEN 1 ELSE 0 END,
    updated_at = now();
END;
$function$;