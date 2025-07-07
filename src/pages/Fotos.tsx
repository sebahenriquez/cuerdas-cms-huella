import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import LightboxModal from '@/components/recorre-la-huella/LightboxModal';
import { getPageBySlug } from '@/lib/page-helpers';

const Fotos: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get page content from the pages system
  const { data: pageData } = useQuery({
    queryKey: ['fotos-page', currentLanguage?.id],
    queryFn: async () => {
      if (!currentLanguage) return null;
      return getPageBySlug('fotos', currentLanguage.id);
    },
    enabled: !!currentLanguage,
  });

  // Get photos page settings for download URL
  const { data: pageSettings } = useQuery({
    queryKey: ['photos-page-settings', currentLanguage?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos_page_settings')
        .select('*')
        .eq('language_id', currentLanguage?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!currentLanguage,
  });

  // Get gallery photos
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

  const pageContent = pageData?.page_contents?.[0];
  const pageTitle = pageContent?.title || 'Berta Rojas';
  const buttonText = pageContent?.content || (currentLanguage?.code === 'es' ? 'Descargue aquí fotos de prensa en alta resolución' : 'Download high-resolution press photos here');
  const creditText = pageSettings?.credit_text || 'Photos: Guillermo Fridman';

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
                {pageTitle}
              </h1>
              
              {pageSettings?.download_url && (
                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 transition-colors text-lg px-8 py-4 mb-4"
                >
                  <Download className="mr-2 h-5 w-5" />
                  {buttonText}
                </Button>
              )}
              
              <p className="text-white/80 text-sm">
                {creditText}
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