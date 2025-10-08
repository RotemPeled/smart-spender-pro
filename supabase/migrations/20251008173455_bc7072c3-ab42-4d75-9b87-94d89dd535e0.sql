-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage on cron schema to postgres
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the retainer generation to run on the first day of every month at 1 AM
SELECT cron.schedule(
  'generate-monthly-retainers',
  '0 1 1 * *', -- At 01:00 on day-of-month 1
  $$
  SELECT
    net.http_post(
        url:='https://ecxjatxoyjipkzweuykj.supabase.co/functions/v1/generate-retainers',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjeGphdHhveWppcGt6d2V1eWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4ODc2ODEsImV4cCI6MjA3NTQ2MzY4MX0.6UxSp4c2D4RzBdpm4NnhOnk9HS9W4D-0ZcF9PoL_Ixg"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);