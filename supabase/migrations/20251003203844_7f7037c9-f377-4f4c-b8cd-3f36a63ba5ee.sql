-- Add featured_artists and composers fields to track_contents table
ALTER TABLE track_contents
ADD COLUMN featured_artists TEXT,
ADD COLUMN composers TEXT;

COMMENT ON COLUMN track_contents.featured_artists IS 'Featured artists for the track (e.g., "feat. Artist Name")';
COMMENT ON COLUMN track_contents.composers IS 'Composers/songwriters of the track';