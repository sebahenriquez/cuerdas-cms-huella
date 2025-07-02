-- Enable RLS on languages table
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to languages
CREATE POLICY "Languages are publicly readable" 
ON public.languages 
FOR SELECT 
USING (true);