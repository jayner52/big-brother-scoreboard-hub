-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create cron job to automatically close expired drafts every minute
SELECT cron.schedule(
  'auto-close-expired-drafts',
  '* * * * *', -- Run every minute
  $$
  SELECT
    net.http_post(
        url:='https://pmjghbyryxzqkirzfxsa.supabase.co/functions/v1/draft-auto-closer',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtamdoYnlyeXh6cWtpcnpmeHNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0Njc1NzEsImV4cCI6MjA2NzA0MzU3MX0.73cFvfDp9xcdv6dv6DsUUJBt6kNC1E5yn1AF44DrPGQ"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);