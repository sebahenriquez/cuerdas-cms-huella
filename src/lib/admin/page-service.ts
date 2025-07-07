
import { supabase } from '@/integrations/supabase/client';

export interface PageData {
  id: number;
  slug: string;
  template_type: string;
  status: string;
  page_contents: PageContent[];
}

export interface PageContent {
  id?: number;
  title: string;
  content: string;
  meta_description: string;
  hero_image_url: string;
  language_id: number;
}

export const pageService = {
  async getAll(): Promise<PageData[]> {
    const { data, error } = await supabase
      .from('pages')
      .select(`
        *,
        page_contents(*)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id: number): Promise<PageData | null> {
    const { data, error } = await supabase
      .from('pages')
      .select(`
        *,
        page_contents(*)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(pageData: Omit<PageData, 'id'>): Promise<PageData> {
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .insert({
        slug: pageData.slug,
        template_type: pageData.template_type,
        status: pageData.status
      })
      .select()
      .single();

    if (pageError) throw pageError;

    // Insert page contents
    if (pageData.page_contents.length > 0) {
      const { error: contentError } = await supabase
        .from('page_contents')
        .insert(
          pageData.page_contents.map(content => ({
            ...content,
            page_id: page.id
          }))
        );

      if (contentError) throw contentError;
    }

    return await this.getById(page.id);
  },

  async update(id: number, pageData: Partial<PageData>): Promise<void> {
    // Update page basic info
    const { error: pageError } = await supabase
      .from('pages')
      .update({
        slug: pageData.slug,
        template_type: pageData.template_type,
        status: pageData.status
      })
      .eq('id', id);

    if (pageError) throw pageError;

    // Update page contents
    if (pageData.page_contents) {
      for (const content of pageData.page_contents) {
        if (content.id) {
          const { error } = await supabase
            .from('page_contents')
            .update({
              title: content.title,
              content: content.content,
              meta_description: content.meta_description,
              hero_image_url: content.hero_image_url
            })
            .eq('id', content.id);
          
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('page_contents')
            .insert({
              ...content,
              page_id: id
            });
          
          if (error) throw error;
        }
      }
    }
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
