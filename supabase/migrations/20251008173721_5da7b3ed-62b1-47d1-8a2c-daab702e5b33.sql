-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Create cron job to generate retainers on the 1st of each month at 00:00
-- This will call the edge function
SELECT cron.schedule(
  'generate-monthly-retainers',
  '0 0 1 * *', -- At 00:00 on day 1 of every month
  $$
  SELECT
    net.http_post(
      url:='https://ecxjatxoyjipkzweuykj.supabase.co/functions/v1/generate-retainers',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeGphdHhveWppcGt6d2V1eWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODc2ODEsImV4cCI6MjA3NTQ2MzY4MX0.6UxSp4c2D4RzBdpm4NnhOnk9HS9W4D-0ZcF9PoL_Ixg"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);