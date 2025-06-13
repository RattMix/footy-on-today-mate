
-- Create matches cache table
CREATE TABLE public.matches_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  competition_id INTEGER NOT NULL,
  match_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour'),
  UNIQUE(date, competition_id)
);

-- Create TV listings cache table
CREATE TABLE public.tv_listings_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  listings_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 hour')
);

-- Add indexes for better performance
CREATE INDEX idx_matches_cache_date_competition ON public.matches_cache(date, competition_id);
CREATE INDEX idx_matches_cache_expires_at ON public.matches_cache(expires_at);
CREATE INDEX idx_tv_listings_cache_date ON public.tv_listings_cache(date);
CREATE INDEX idx_tv_listings_cache_expires_at ON public.tv_listings_cache(expires_at);

-- Enable Row Level Security (but allow all operations for service role)
ALTER TABLE public.matches_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tv_listings_cache ENABLE ROW LEVEL SECURITY;

-- Create policies to allow service role to manage cache data
CREATE POLICY "Service role can manage matches cache" 
  ON public.matches_cache 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Service role can manage TV listings cache" 
  ON public.tv_listings_cache 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Allow anonymous users to read cache data (for public API access)
CREATE POLICY "Anonymous can read matches cache" 
  ON public.matches_cache 
  FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Anonymous can read TV listings cache" 
  ON public.tv_listings_cache 
  FOR SELECT 
  TO anon 
  USING (true);
