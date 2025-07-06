
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';

interface SectionContent {
  id?: number;
  title: string;
  subtitle: string;
  content: string;
  language_id: number;
}

interface SectionData {
  id: number;
  section_key: string;
  order_position: number;
  is_active: boolean;
  about_section_contents: SectionContent[];
}

const AdminAboutSectionEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const sectionId = parseInt(id || '0');

  const [sectionData, setSectionData] = useState<Partial<SectionData>>({
    about_section_contents: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const { data: existingSection, isLoading } = useQuery({
    queryKey: ['about-section', sectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select(`
          *,
          about_section_contents(*)
        `)
        .eq('id', sectionId)
        .single();
      
      if (error) throw error;
      return data as SectionData;
    },
    enabled: sectionId > 0
  });

  useEffect(() => {
    if (existingSection) {
      setSectionData(existingSection);
    } else if (languages.length > 0 && sectionData.about_section_contents?.length === 0) {
      // Initialize empty content for all languages
      setSectionData(prev => ({
        ...prev,
        about_section_contents: languages.map(lang => ({
          title: '',
          subtitle: '',
          content: '',
          language_id: lang.id
        }))
      }));
    }
  }, [existingSection, languages]);

  const saveSection = useMutation({
    mutationFn: async (data: Partial<SectionData>) => {
      // Update or insert section contents
      for (const content of data.about_section_contents || []) {
        if (content.id) {
          const { error } = await supabase
            .from('about_section_contents')
            .update(content)
            .eq('id', content.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('about_section_contents')
            .insert({
              ...content,
              about_section_id: sectionId
            });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-sections'] });
      queryClient.invalidateQueries({ queryKey: ['about-section', sectionId] });
      
      toast({
        title: 'Sección guardada',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/about');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving section:', error);
    }
  });

  const updateSectionContent = (languageId: number, field: keyof SectionContent, value: string) => {
    setSectionData(prev => ({
      ...prev,
      about_section_contents: prev.about_section_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || []
    }));
  };

  const handleSave = () => {
    saveSection.mutate(sectionData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Get section title for display
  const getSectionTitle = () => {
    const titles = {
      'hero': 'Hero Section',
      'general_explanation': 'Explicación General',
      'feature_cards': 'Tarjetas de Características',
      'book_introduction': 'Introducción del Libro',
      'project_stats': 'Estadísticas del Proyecto'
    };
    return titles[sectionData.section_key as keyof typeof titles] || sectionData.section_key;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/about')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a About
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Sección</h1>
            <p className="text-muted-foreground">
              {getSectionTitle()}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saveSection.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveSection.isPending ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contenido Multiidioma</CardTitle>
          <CardDescription>Edita el contenido en diferentes idiomas</CardDescription>
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
              const content = sectionData.about_section_contents?.find(c => c.language_id === language.id);
              
              return (
                <TabsContent key={language.id} value={language.code} className="space-y-4">
                  <div>
                    <Label htmlFor={`title-${language.id}`}>Título</Label>
                    <Input
                      id={`title-${language.id}`}
                      value={content?.title || ''}
                      onChange={(e) => updateSectionContent(language.id, 'title', e.target.value)}
                      placeholder="Título de la sección"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`subtitle-${language.id}`}>Subtítulo</Label>
                    <Input
                      id={`subtitle-${language.id}`}
                      value={content?.subtitle || ''}
                      onChange={(e) => updateSectionContent(language.id, 'subtitle', e.target.value)}
                      placeholder="Subtítulo opcional"
                    />
                  </div>

                  <div>
                    <Label htmlFor={`content-${language.id}`}>Contenido</Label>
                    <div className="mt-2">
                      <RichTextEditor
                        content={content?.content || ''}
                        onChange={(value) => updateSectionContent(language.id, 'content', value)}
                        placeholder="Contenido de la sección - usa el editor de texto enriquecido para formatear tu contenido"
                      />
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAboutSectionEdit;
