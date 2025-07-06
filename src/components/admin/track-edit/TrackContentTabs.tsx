
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RichTextEditor from '@/components/admin/RichTextEditor';

interface Language {
  id: number;
  name: string;
  code: string;
}

interface TrackContent {
  id?: number;
  title: string;
  menu_title: string;
  description: string;
  long_text_content: string;
  hero_image_url: string;
  language_id: number;
}

interface TrackContentTabsProps {
  languages: Language[];
  trackContents: TrackContent[];
  onContentChange: (languageId: number, field: keyof TrackContent, value: string) => void;
}

const TrackContentTabs: React.FC<TrackContentTabsProps> = ({
  languages,
  trackContents,
  onContentChange
}) => {
  // Log para debug
  useEffect(() => {
    console.log('TrackContentTabs - Languages:', languages);
    console.log('TrackContentTabs - TrackContents:', trackContents);
  }, [languages, trackContents]);

  // Asegurar que tenemos contenido para todos los idiomas
  const ensureContentForAllLanguages = () => {
    return languages.map(language => {
      const existingContent = trackContents.find(c => c.language_id === language.id);
      if (existingContent) {
        return existingContent;
      }
      
      // Crear contenido vacío si no existe
      console.log(`Creating empty content for language ${language.name} (${language.id})`);
      return {
        title: '',
        menu_title: '',
        description: '',
        long_text_content: '',
        hero_image_url: '',
        language_id: language.id
      };
    });
  };

  const completeTrackContents = ensureContentForAllLanguages();

  if (languages.length === 0) {
    return (
      <Card className="lg:col-span-3">
        <CardContent className="p-6">
          <div className="text-center">
            <p>Cargando idiomas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Contenido</CardTitle>
        <CardDescription>Edita el contenido en diferentes idiomas con el editor de texto enriquecido</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={languages[0]?.code} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            {languages.map((language) => (
              <TabsTrigger key={language.id} value={language.code}>
                {language.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {languages.map((language) => {
            const content = completeTrackContents.find(c => c.language_id === language.id) || {
              title: '',
              menu_title: '',
              description: '',
              long_text_content: '',
              hero_image_url: '',
              language_id: language.id
            };
            
            console.log(`Content for ${language.name} (${language.id}):`, content);
            
            return (
              <TabsContent key={language.id} value={language.code} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`title-${language.id}`}>Título</Label>
                    <Input
                      id={`title-${language.id}`}
                      value={content.title || ''}
                      onChange={(e) => {
                        console.log(`Updating title for language ${language.id}:`, e.target.value);
                        onContentChange(language.id, 'title', e.target.value);
                      }}
                      placeholder="Título del track"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`menu_title-${language.id}`}>Título del Menú</Label>
                    <Input
                      id={`menu_title-${language.id}`}
                      value={content.menu_title || ''}
                      onChange={(e) => {
                        console.log(`Updating menu_title for language ${language.id}:`, e.target.value);
                        onContentChange(language.id, 'menu_title', e.target.value);
                      }}
                      placeholder="Título corto para menús"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`description-${language.id}`}>Descripción</Label>
                  <Textarea
                    id={`description-${language.id}`}
                    value={content.description || ''}
                    onChange={(e) => {
                      console.log(`Updating description for language ${language.id}:`, e.target.value);
                      onContentChange(language.id, 'description', e.target.value);
                    }}
                    placeholder="Descripción breve del track"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor={`long_text_content-${language.id}`}>Contenido Largo</Label>
                  <div className="mt-2">
                    <RichTextEditor
                      content={content.long_text_content || ''}
                      onChange={(value) => {
                        console.log(`Updating long_text_content for language ${language.id}:`, value);
                        onContentChange(language.id, 'long_text_content', value);
                      }}
                      placeholder="Contenido detallado del track - usa el editor de texto enriquecido para formatear tu contenido"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`hero_image-${language.id}`}>Imagen Hero (URL)</Label>
                  <Input
                    id={`hero_image-${language.id}`}
                    value={content.hero_image_url || ''}
                    onChange={(e) => {
                      console.log(`Updating hero_image_url for language ${language.id}:`, e.target.value);
                      onContentChange(language.id, 'hero_image_url', e.target.value);
                    }}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TrackContentTabs;
