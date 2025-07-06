
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import FullPageAudioPlayer from '@/components/audio/FullPageAudioPlayer';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const EscuchaLaHuella: React.FC = () => {
  const { currentLanguage } = useLanguage();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['tracks', currentLanguage?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          *,
          track_contents!inner(
            title,
            description,
            hero_image_url,
            language_id
          )
        `)
        .eq('track_contents.language_id', currentLanguage?.id)
        .eq('status', 'published')
        .order('order_position');

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentLanguage,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">
            {currentLanguage?.code === 'es' ? 'Cargando...' : 'Loading...'}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FullPageAudioPlayer tracks={tracks} />
    </Layout>
  );
};

export default EscuchaLaHuella;
