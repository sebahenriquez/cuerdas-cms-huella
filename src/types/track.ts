
export interface TrackContent {
  title?: string;
  menu_title?: string;
  description?: string;
  long_text_content?: string;
  hero_image_url?: string;
  language_id: number;
}

export interface VideoContent {
  title?: string;
  description?: string;
  language_id: number;
}

export interface Video {
  id: number;
  vimeo_url: string;
  video_contents?: VideoContent[];
}

export interface FeaturedImage {
  id: number;
  image_url: string;
  caption_es?: string;
  caption_en?: string;
}

export interface Track {
  id: number;
  order_position: number;
  audio_url: string;
  status: string;
  track_contents?: TrackContent[];
  videos?: Video[];
  track_featured_images?: FeaturedImage[];
}
