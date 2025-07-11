
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
          
          {/* Main project description */}
          <div className="mb-8">
            <Card className="bg-white/20 backdrop-blur-sm shadow-2xl border-white/30 mb-6">
              <CardContent className="p-8">
                <h1 className="text-4xl font-bold mb-6 text-white">
                  {currentLanguage?.code === 'es' ? 'El Proyecto' : 'The Project'}
                </h1>
                <p className="text-lg text-white leading-relaxed mb-4">
                  {currentLanguage?.code === 'es' 
                    ? "Berta Rojas nos presenta La Huella de las Cuerdas, una obra integral que describe el impacto cultural de la guitarra en América Latina y redescubre los vínculos que, de distintas maneras, la unen a la gran familia de instrumentos de cuerda del continente."
                    : "Berta Rojas presents The Journey of Strings, a project tracing the cultural impact of the guitar in Latin America and illuminating the ties that bind it in so many ways to the wider family of stringed instruments in the Americas."
                  }
                </p>
                <p className="text-lg text-white leading-relaxed">
                  {currentLanguage?.code === 'es' 
                    ? "Esta edición especial es una experiencia multimedia en un formato único y cuidada producción:"
                    : "A special edition unique high-quality multimedia package:"
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Cards Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Book className="h-12 w-12 mx-auto text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {currentLanguage?.code === 'es' ? 'LIBRO' : 'BOOK'}
                  </h3>
                  <p className="text-sm text-white leading-relaxed">
                    {currentLanguage?.code === 'es' 
                      ? "Un estudio profundo de cada instrumento y sus tradiciones. Historias fascinantes y fotos de gran formato que documentan el viaje y los encuentros de Berta con los músicos en el centro del proyecto."
                      : "An in-depth study of each instrument and its traditions. Fascinating stories and large-format photos documenting the journey and Berta's encounters with the musicians at the centre of the project."
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Disc className="h-12 w-12 mx-auto text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {currentLanguage?.code === 'es' ? 'VINILO' : 'VINYL'}
                  </h3>
                  <p className="text-sm text-white leading-relaxed">
                    {currentLanguage?.code === 'es' 
                      ? "Audio en vinilo de excelente calidad de 180 gramos; diez pistas que construyen y acompañan una aventura en sonido."
                      : "Excellent quality 180 gram vinyl audio; ten tracks that build and accompany an adventure in sound."
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/20 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1 border-white/30">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Smartphone className="h-12 w-12 mx-auto text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">
                    {currentLanguage?.code === 'es' ? 'REALIDAD AUMENTADA' : 'AUGMENTED REALITY'}
                  </h3>
                  <p className="text-sm text-white leading-relaxed">
                    {currentLanguage?.code === 'es' 
                      ? "Descarga la aplicación gratuita La Huella de las Cuerdas en tu smartphone o tablet. Apunta la cámara a las fotos del libro y abre un nuevo mundo de contenido digital para mejorar tu experiencia."
                      : "Download the free La Huella de las Cuerdas app to your smartphone or tablet. Point the camera at the photos in the book and open up a new world of digital content to enhance your experience."
                    }
                  </p>
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
