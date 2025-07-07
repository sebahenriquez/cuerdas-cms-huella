
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const Prensa: React.FC = () => {
  const { currentLanguage } = useLanguage();

  const { data: pressKitSettings } = useQuery({
    queryKey: ['press-kit-settings', currentLanguage?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('press_kit_settings')
        .select('*')
        .eq('language_id', currentLanguage?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentLanguage,
  });

  const handleDownload = () => {
    if (pressKitSettings?.download_url) {
      // Create a temporary anchor element for download
      const link = document.createElement('a');
      link.href = pressKitSettings.download_url;
      link.download = 'TheJourneyOfStringsRelease.zip'; // Suggest filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Layout>
      <div 
        className="min-h-screen flex items-center justify-center relative"
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
        <div className="relative z-10 text-center text-white max-w-2xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-8">
            {pressKitSettings?.description || (currentLanguage?.code === 'es' ? 'Descargue el kit de prensa' : 'Download the press kit')}
          </h1>
          
          <Button
            onClick={handleDownload}
            size="lg"
            className="bg-white text-black hover:bg-gray-100 transition-colors text-lg px-8 py-4 mb-12"
          >
            <Download className="mr-2 h-5 w-5" />
            {pressKitSettings?.button_label || (currentLanguage?.code === 'es' ? 'Kit de Prensa' : 'Press Kit')}
          </Button>

          {/* Press Contact Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white max-w-md mx-auto">
            <h3 className="text-lg font-bold mb-4 text-center">U.S. & UK PRESS CONTACT</h3>
            <div className="space-y-2 text-center">
              <p className="font-semibold">Diane Blackman, BRPR</p>
              <p className="font-semibold">Co-Founder & President</p>
              <p className="text-white/90">212.249.5125</p>
              <p className="text-white/90">dblackman@brpublicrelations.com</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Prensa;
