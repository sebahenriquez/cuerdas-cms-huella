export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      about_feature_card_contents: {
        Row: {
          created_at: string | null
          description: string | null
          feature_card_id: number | null
          id: number
          language_id: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_card_id?: number | null
          id?: number
          language_id?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_card_id?: number | null
          id?: number
          language_id?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "about_feature_card_contents_feature_card_id_fkey"
            columns: ["feature_card_id"]
            isOneToOne: false
            referencedRelation: "about_feature_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "about_feature_card_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      about_feature_cards: {
        Row: {
          card_key: string
          created_at: string | null
          icon_name: string | null
          id: number
          is_active: boolean | null
          order_position: number | null
          updated_at: string | null
        }
        Insert: {
          card_key: string
          created_at?: string | null
          icon_name?: string | null
          id?: number
          is_active?: boolean | null
          order_position?: number | null
          updated_at?: string | null
        }
        Update: {
          card_key?: string
          created_at?: string | null
          icon_name?: string | null
          id?: number
          is_active?: boolean | null
          order_position?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      about_project_stat_contents: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          label: string
          language_id: number | null
          project_stat_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          label: string
          language_id?: number | null
          project_stat_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          label?: string
          language_id?: number | null
          project_stat_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "about_project_stat_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "about_project_stat_contents_project_stat_id_fkey"
            columns: ["project_stat_id"]
            isOneToOne: false
            referencedRelation: "about_project_stats"
            referencedColumns: ["id"]
          },
        ]
      }
      about_project_stats: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          number_value: number | null
          order_position: number | null
          stat_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          number_value?: number | null
          order_position?: number | null
          stat_key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          number_value?: number | null
          order_position?: number | null
          stat_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      about_section_contents: {
        Row: {
          about_section_id: number | null
          content: string | null
          created_at: string | null
          id: number
          language_id: number | null
          metadata: Json | null
          subtitle: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          about_section_id?: number | null
          content?: string | null
          created_at?: string | null
          id?: number
          language_id?: number | null
          metadata?: Json | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          about_section_id?: number | null
          content?: string | null
          created_at?: string | null
          id?: number
          language_id?: number | null
          metadata?: Json | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "about_section_contents_about_section_id_fkey"
            columns: ["about_section_id"]
            isOneToOne: false
            referencedRelation: "about_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "about_section_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      about_sections: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          order_position: number | null
          section_key: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          order_position?: number | null
          section_key: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          order_position?: number | null
          section_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          password_hash: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          password_hash: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          password_hash?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cta_button_contents: {
        Row: {
          created_at: string | null
          cta_button_id: number | null
          description: string | null
          id: number
          label: string
          language_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          cta_button_id?: number | null
          description?: string | null
          id?: number
          label: string
          language_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          cta_button_id?: number | null
          description?: string | null
          id?: number
          label?: string
          language_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cta_button_contents_cta_button_id_fkey"
            columns: ["cta_button_id"]
            isOneToOne: false
            referencedRelation: "cta_buttons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cta_button_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      cta_buttons: {
        Row: {
          created_at: string | null
          id: number
          is_active: boolean | null
          key: string
          order_position: number | null
          updated_at: string | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          key: string
          order_position?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          key?: string
          order_position?: number | null
          updated_at?: string | null
          url?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          caption: string | null
          gallery_id: number | null
          id: number
          media_file_id: number | null
          order_position: number | null
        }
        Insert: {
          caption?: string | null
          gallery_id?: number | null
          id?: number
          media_file_id?: number | null
          order_position?: number | null
        }
        Update: {
          caption?: string | null
          gallery_id?: number | null
          id?: number
          media_file_id?: number | null
          order_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "image_galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_images_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      image_galleries: {
        Row: {
          created_at: string | null
          id: number
          track_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          track_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          track_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "image_galleries_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string | null
          id: number
          is_default: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          is_default?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      media_files: {
        Row: {
          alt_text: string | null
          file_path: string | null
          file_size: number | null
          filename: string
          id: number
          mime_type: string | null
          original_name: string | null
          uploaded_at: string | null
        }
        Insert: {
          alt_text?: string | null
          file_path?: string | null
          file_size?: number | null
          filename: string
          id?: number
          mime_type?: string | null
          original_name?: string | null
          uploaded_at?: string | null
        }
        Update: {
          alt_text?: string | null
          file_path?: string | null
          file_size?: number | null
          filename?: string
          id?: number
          mime_type?: string | null
          original_name?: string | null
          uploaded_at?: string | null
        }
        Relationships: []
      }
      navigation_contents: {
        Row: {
          id: number
          language_id: number | null
          navigation_id: number | null
          title: string
        }
        Insert: {
          id?: number
          language_id?: number | null
          navigation_id?: number | null
          title: string
        }
        Update: {
          id?: number
          language_id?: number | null
          navigation_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_contents_navigation_id_fkey"
            columns: ["navigation_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_items: {
        Row: {
          created_at: string | null
          icon: string | null
          id: number
          order_position: number
          parent_id: number | null
          url: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: number
          order_position: number
          parent_id?: number | null
          url?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: number
          order_position?: number
          parent_id?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      page_contents: {
        Row: {
          content: string | null
          created_at: string | null
          hero_image_url: string | null
          id: number
          language_id: number | null
          meta_description: string | null
          page_id: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          hero_image_url?: string | null
          id?: number
          language_id?: number | null
          meta_description?: string | null
          page_id?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          hero_image_url?: string | null
          id?: number
          language_id?: number | null
          meta_description?: string | null
          page_id?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_contents_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string | null
          id: number
          slug: string
          status: string | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          slug: string
          status?: string | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          slug?: string
          status?: string | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string | null
          id: number
          key: string
          language_id: number | null
          value: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          key: string
          language_id?: number | null
          value?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          key?: string
          language_id?: number | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_settings: {
        Row: {
          accent_color: string | null
          background_color: string | null
          font_family: string | null
          id: number
          primary_color: string | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          font_family?: string | null
          id?: number
          primary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          font_family?: string | null
          id?: number
          primary_color?: string | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      track_contents: {
        Row: {
          content_blocks: Json | null
          created_at: string | null
          description: string | null
          hero_image_url: string | null
          id: number
          language_id: number | null
          long_text_content: string | null
          menu_title: string | null
          status: string | null
          title: string | null
          track_id: number | null
          updated_at: string | null
        }
        Insert: {
          content_blocks?: Json | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: number
          language_id?: number | null
          long_text_content?: string | null
          menu_title?: string | null
          status?: string | null
          title?: string | null
          track_id?: number | null
          updated_at?: string | null
        }
        Update: {
          content_blocks?: Json | null
          created_at?: string | null
          description?: string | null
          hero_image_url?: string | null
          id?: number
          language_id?: number | null
          long_text_content?: string | null
          menu_title?: string | null
          status?: string | null
          title?: string | null
          track_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_contents_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_cta_settings: {
        Row: {
          created_at: string | null
          id: number
          photos_label_en: string | null
          photos_label_es: string | null
          show_photos: boolean | null
          show_texts: boolean | null
          show_videos: boolean | null
          texts_label_en: string | null
          texts_label_es: string | null
          track_id: number | null
          updated_at: string | null
          videos_label_en: string | null
          videos_label_es: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          photos_label_en?: string | null
          photos_label_es?: string | null
          show_photos?: boolean | null
          show_texts?: boolean | null
          show_videos?: boolean | null
          texts_label_en?: string | null
          texts_label_es?: string | null
          track_id?: number | null
          updated_at?: string | null
          videos_label_en?: string | null
          videos_label_es?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          photos_label_en?: string | null
          photos_label_es?: string | null
          show_photos?: boolean | null
          show_texts?: boolean | null
          show_videos?: boolean | null
          texts_label_en?: string | null
          texts_label_es?: string | null
          track_id?: number | null
          updated_at?: string | null
          videos_label_en?: string | null
          videos_label_es?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "track_cta_settings_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: true
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_featured_images: {
        Row: {
          caption_en: string | null
          caption_es: string | null
          created_at: string | null
          id: number
          image_url: string | null
          media_file_id: number | null
          order_position: number | null
          track_id: number | null
        }
        Insert: {
          caption_en?: string | null
          caption_es?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          media_file_id?: number | null
          order_position?: number | null
          track_id?: number | null
        }
        Update: {
          caption_en?: string | null
          caption_es?: string | null
          created_at?: string | null
          id?: number
          image_url?: string | null
          media_file_id?: number | null
          order_position?: number | null
          track_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "track_featured_images_media_file_id_fkey"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_featured_images_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      track_quotes: {
        Row: {
          author_name: string
          author_role: string | null
          created_at: string | null
          id: number
          language_id: number | null
          order_position: number | null
          quote_text: string
          track_id: number | null
        }
        Insert: {
          author_name: string
          author_role?: string | null
          created_at?: string | null
          id?: number
          language_id?: number | null
          order_position?: number | null
          quote_text: string
          track_id?: number | null
        }
        Update: {
          author_name?: string
          author_role?: string | null
          created_at?: string | null
          id?: number
          language_id?: number | null
          order_position?: number | null
          quote_text?: string
          track_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "track_quotes_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "track_quotes_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
      tracks: {
        Row: {
          audio_url: string | null
          created_at: string | null
          id: number
          order_position: number
          status: string | null
          updated_at: string | null
        }
        Insert: {
          audio_url?: string | null
          created_at?: string | null
          id?: number
          order_position: number
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_url?: string | null
          created_at?: string | null
          id?: number
          order_position?: number
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      video_contents: {
        Row: {
          description: string | null
          id: number
          language_id: number | null
          title: string | null
          video_id: number | null
        }
        Insert: {
          description?: string | null
          id?: number
          language_id?: number | null
          title?: string | null
          video_id?: number | null
        }
        Update: {
          description?: string | null
          id?: number
          language_id?: number | null
          title?: string | null
          video_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "video_contents_language_id_fkey"
            columns: ["language_id"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_contents_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          created_at: string | null
          id: number
          order_position: number | null
          thumbnail_url: string | null
          track_id: number | null
          vimeo_url: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          order_position?: number | null
          thumbnail_url?: string | null
          track_id?: number | null
          vimeo_url?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          order_position?: number | null
          thumbnail_url?: string | null
          track_id?: number | null
          vimeo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_track_id_fkey"
            columns: ["track_id"]
            isOneToOne: false
            referencedRelation: "tracks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
