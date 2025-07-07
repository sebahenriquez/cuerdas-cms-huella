import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import LightboxModal from '@/components/recorre-la-huella/LightboxModal';

const Fotos: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: pageSettings } = useQuery({
    queryKey: ['photos-page-settings', currentLanguage?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos_page_settings')
        .select('*')
        .eq('language_id', currentLanguage?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentLanguage,
  });

  const { data: photos = [] } = useQuery({
    queryKey: ['gallery-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('is_active', true)
        .order('order_position');

      if (error) throw error;
      return data;
    },
  });

  const handleDownload = () => {
    if (pageSettings?.download_url) {
      const link = document.createElement('a');
      link.href = pageSettings.download_url;
      link.download = 'BertaRojas-PressFotos.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Layout>
      <div 
        className="min-h-screen py-20"
        style={{
          backgroundImage: 'url(https://i.ibb.co/b5ZP5v2w/Huellas-27-05-201.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Content */}
        <div className="relative z-10 container-wide">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
                {pageSettings?.page_title || 'Berta Rojas'}
              </h1>
              
              {pageSettings?.download_url && (
                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 transition-colors text-lg px-8 py-4 mb-4"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {pageSettings?.download_button_text || 'Download Photos'}
                </Button>
              )}
              
              <p className="text-white/80 text-sm">
                {pageSettings?.credit_text || 'Photos: Guillermo Fridman'}
              </p>
            </div>

            {/* Photo Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => setSelectedImage(photo.image_url)}
                >
                  <img
                    src={photo.image_url}
                    alt="Berta Rojas"
                    className="w-full h-64 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDQwMCAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xODAgMTI4SDE4MFYxMjhIMjIwVjEyOEgyMjBWMTI4SDE4MFoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <LightboxModal
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </Layout>
  );
};

export default Fotos;