
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Save, Mouse } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAllCTAButtons, getLanguages } from '@/lib/supabase-helpers';

const AdminCTAButtons: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [buttonTexts, setButtonTexts] = useState<Record<string, Record<number, string>>>({});

  const { data: ctaButtons } = useQuery({
    queryKey: ['cta-buttons'],
    queryFn: getAllCTAButtons
  });

  const { data: languages } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  React.useEffect(() => {
    if (ctaButtons && Array.isArray(ctaButtons)) {
      const textsObj: Record<string, Record<number, string>> = {};
      ctaButtons.forEach((button: any) => {
        if (button?.key && button?.cta_button_contents) {
          textsObj[button.key] = {};
          button.cta_button_contents.forEach((content: any) => {
            if (content?.language_id && content?.text) {
              textsObj[button.key][content.language_id] = content.text;
            }
          });
        }
      });
      setButtonTexts(textsObj);
    }
  }, [ctaButtons]);

  const saveCTAButtons = useMutation({
    mutationFn: async (data: Record<string, Record<number, string>>) => {
      for (const [buttonKey, languageTexts] of Object.entries(data)) {
        const button = ctaButtons?.find((b: any) => b?.key === buttonKey);
        if (!button) continue;

        for (const [languageId, text] of Object.entries(languageTexts)) {
          const existingContent = button.cta_button_contents?.find(
            (c: any) => c?.language_id === parseInt(languageId)
          );

          if (existingContent) {
            const { error } = await supabase
              .from('cta_button_contents' as any)
              .update({ text })
              .eq('id', existingContent.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('cta_button_contents' as any)
              .insert({
                cta_button_id: button.id,
                language_id: parseInt(languageId),
                text
              });
            if (error) throw error;
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cta-buttons'] });
      toast({
        title: 'Textos de botones guardados',
        description: 'Los cambios han sido aplicados correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
    }
  });

  const handleTextChange = (buttonKey: string, languageId: number, text: string) => {
    setButtonTexts(prev => ({
      ...prev,
      [buttonKey]: {
        ...prev[buttonKey],
        [languageId]: text
      }
    }));
  };

  const handleSave = () => {
    saveCTAButtons.mutate(buttonTexts);
  };

  const getButtonDisplayName = (key: string) => {
    switch (key) {
      case 'explore_trail':
        return 'Botón "Recorré la Huella"';
      case 'listen_album':
        return 'Botón "Escuchar el Álbum"';
      default:
        return key;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Botones Call to Action</h1>
          <p className="text-muted-foreground">
            Administra los textos de los botones del home
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mouse className="h-5 w-5" />
            Textos de Botones CTA
          </CardTitle>
          <CardDescription>
            Edita los textos de los botones call to action que aparecen en la página principal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {ctaButtons && Array.isArray(ctaButtons) && ctaButtons.map((button: any) => (
            button?.key ? (
              <div key={button.key} className="border rounded-lg p-4 space-y-4">
                <h3 className="text-lg font-semibold">{getButtonDisplayName(button.key)}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {languages && Array.isArray(languages) && languages.map((lang: any) => (
                    lang?.id && lang?.name ? (
                      <div key={lang.id}>
                        <Label htmlFor={`${button.key}-${lang.id}`}>
                          Texto en {lang.name}
                        </Label>
                        <Input
                          id={`${button.key}-${lang.id}`}
                          value={buttonTexts[button.key]?.[lang.id] || ''}
                          onChange={(e) => handleTextChange(button.key, lang.id, e.target.value)}
                          placeholder={`Texto del botón en ${lang.name.toLowerCase()}`}
                        />
                      </div>
                    ) : null
                  ))}
                </div>
              </div>
            ) : null
          ))}

          <Button onClick={handleSave} disabled={saveCTAButtons.isPending} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {saveCTAButtons.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCTAButtons;
