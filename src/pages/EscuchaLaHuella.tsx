
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const EscuchaLaHuella: React.FC = () => {
  const { currentLanguage } = useLanguage();

  const { data: tracks = [] } = useQuery({
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

  return (
    <Layout showAudioPlayer={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Tracks Grid */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracks.map((track) => {
              const content = track.track_contents?.[0];
              return (
                <div
                  key={track.id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {content?.hero_image_url && (
                    <div className="aspect-video bg-gray-200">
                      <img
                        src={content.hero_image_url}
                        alt={content.title || ''}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {content?.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {content?.description}
                    </p>
                    <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors">
                      {currentLanguage?.code === 'es' ? 'Escuchar' : 'Listen'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EscuchaLaHuella;
