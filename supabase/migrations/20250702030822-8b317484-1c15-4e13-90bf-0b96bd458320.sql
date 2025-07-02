-- Enable CMS users to manage all content
-- Note: This assumes you have a secure CMS authentication system in place

-- Allow CMS operations on pages
CREATE POLICY "CMS users can manage pages" 
ON public.pages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on page_contents
CREATE POLICY "CMS users can manage page contents" 
ON public.page_contents 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on tracks
CREATE POLICY "CMS users can manage tracks" 
ON public.tracks 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on track_contents
CREATE POLICY "CMS users can manage track contents" 
ON public.track_contents 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on videos
CREATE POLICY "CMS users can manage videos" 
ON public.videos 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on video_contents
CREATE POLICY "CMS users can manage video contents" 
ON public.video_contents 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on languages
CREATE POLICY "CMS users can manage languages" 
ON public.languages 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on media_files
CREATE POLICY "CMS users can manage media files" 
ON public.media_files 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on track_quotes
CREATE POLICY "CMS users can manage track quotes" 
ON public.track_quotes 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on track_featured_images
CREATE POLICY "CMS users can manage track featured images" 
ON public.track_featured_images 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on image_galleries
CREATE POLICY "CMS users can manage image galleries" 
ON public.image_galleries 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on gallery_images
CREATE POLICY "CMS users can manage gallery images" 
ON public.gallery_images 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on site_settings
CREATE POLICY "CMS users can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on theme_settings
CREATE POLICY "CMS users can manage theme settings" 
ON public.theme_settings 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on navigation_items
CREATE POLICY "CMS users can manage navigation items" 
ON public.navigation_items 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Allow CMS operations on navigation_contents
CREATE POLICY "CMS users can manage navigation contents" 
ON public.navigation_contents 
FOR ALL 
USING (true)
WITH CHECK (true);