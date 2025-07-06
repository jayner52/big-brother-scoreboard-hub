-- Create function to increment unread counts
CREATE OR REPLACE FUNCTION public.increment_unread_counts(
  target_user_id UUID,
  target_pool_id UUID,
  is_mention BOOLEAN DEFAULT FALSE
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update read status
  INSERT INTO public.chat_read_status (user_id, pool_id, unread_count, unread_mentions)
  VALUES (target_user_id, target_pool_id, 1, CASE WHEN is_mention THEN 1 ELSE 0 END)
  ON CONFLICT (user_id, pool_id) 
  DO UPDATE SET
    unread_count = chat_read_status.unread_count + 1,
    unread_mentions = chat_read_status.unread_mentions + CASE WHEN is_mention THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;