
-- Enable the required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create a scheduled job that runs daily at 4:00 AM UTC
-- This will call our cache update function to pre-populate fixture data
SELECT cron.schedule(
  'daily-fixtures-cache-update',
  '0 4 * * *', -- Every day at 4:00 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://bxgsfctuzxjhczioymqx.supabase.co/functions/v1/update-fixtures-cache',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3NmY3R1enhqaGN6aW95bXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDg0NjUsImV4cCI6MjA2NTM4NDQ2NX0.z5mlnClhj2Ocpc5KgkKPAnXVyKiYfR09d_3lAWUPDSA"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);
