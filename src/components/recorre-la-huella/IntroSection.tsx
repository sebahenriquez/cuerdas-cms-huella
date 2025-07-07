
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Book, Disc, Smartphone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface IntroContent {
  title?: string;
  content?: string;
  hero_image_url?: string;
}

interface IntroSectionProps {
  introContent: IntroContent | null;
  onStartJourney: () => void;
  startJourneyButtonText?: string;
}

const IntroSection: React.FC<IntroSectionProps> = ({ 
  introContent, 
  onStartJourney, 
  startJourneyButtonText = 'Comenzar el Recorrido'
}) => {
  const { currentLanguage } = useLanguage();

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative pt-24 flex items-center"
      style={{
        backgroundImage: introContent?.hero_image_url 
          ? `url(${introContent.hero_image_url})`
          : 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f)'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content container - centered and compact */}
      <div className="relative z-10 w-full px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          {/* Feature Cards Section - more compact */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Book className="h-12 w-12 mx-auto text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {currentLanguage?.code === 'es' ? 'EL LIBRO' : 'BOOK'}
                  </h3>
                </CardContent>
              </Card>

              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Disc className="h-12 w-12 mx-auto text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {currentLanguage?.code === 'es' ? 'EL VINILO' : 'VINYL'}
                  </h3>
                </CardContent>
              </Card>

              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Smartphone className="h-12 w-12 mx-auto text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {currentLanguage?.code === 'es' ? 'LA REALIDAD AUMENTADA' : 'AUGMENTED REALITY'}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* Collection description */}
            <div className="mb-8">
              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30">
                <CardContent className="p-6">
                  <p className="text-lg text-white leading-relaxed">
                    {currentLanguage?.code === 'es' 
                      ? "Esta colección es el fruto de un viaje por más de diez países y la colaboración de Berta con músicos que encarnan la riqueza cultural de América."
                      : "This collection is the fruit of a journey through more than ten countries and Berta's collaboration with musicians who embody the cultural richness of America."
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={onStartJourney}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              {startJourneyButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntroSection;
