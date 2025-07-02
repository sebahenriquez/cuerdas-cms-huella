import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, Settings, Palette, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeSettings {
  primary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
}

interface SiteSetting {
  id: number;
  key: string;
  value: string;
  language_id: number;
}

const AdminSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    primary_color: '#FFFFFF',
    accent_color: '#DC2626',
    background_color: '#F8F8F8',
    text_color: '#212121',
    font_family: 'Inter'
  });

  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({
    site_name: 'La Huella de las Cuerdas',
    site_description: 'Un proyecto musical interactivo',
    contact_email: 'info@lahuellaselascuerdas.com',
    social_facebook: '',
    social_instagram: '',
    social_youtube: ''
  });

  const { data: existingTheme } = useQuery({
    queryKey: ['theme-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('theme_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const { data: existingSiteSettings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');
      
      if (error) throw error;
      return data as SiteSetting[];
    }
  });

  React.useEffect(() => {
    if (existingTheme) {
      setThemeSettings(existingTheme);
    }
  }, [existingTheme]);

  React.useEffect(() => {
    if (existingSiteSettings) {
      const settingsObj: Record<string, string> = {};
      existingSiteSettings.forEach(setting => {
        settingsObj[setting.key] = setting.value || '';
      });
      setSiteSettings(prev => ({ ...prev, ...settingsObj }));
    }
  }, [existingSiteSettings]);

  const saveThemeSettings = useMutation({
    mutationFn: async (data: ThemeSettings) => {
      if (existingTheme) {
        const { error } = await supabase
          .from('theme_settings')
          .update(data)
          .eq('id', existingTheme.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('theme_settings')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theme-settings'] });
      toast({
        title: 'Configuración de tema guardada',
        description: 'Los cambios de tema han sido aplicados.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios de tema.',
        variant: 'destructive',
      });
    }
  });

  const saveSiteSettings = useMutation({
    mutationFn: async (data: Record<string, string>) => {
      for (const [key, value] of Object.entries(data)) {
        const existingSetting = existingSiteSettings?.find(s => s.key === key);
        
        if (existingSetting) {
          const { error } = await supabase
            .from('site_settings')
            .update({ value })
            .eq('id', existingSetting.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('site_settings')
            .insert({ key, value, language_id: 1 });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Configuración del sitio guardada',
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

  const handleThemeSave = () => {
    saveThemeSettings.mutate(themeSettings);
  };

  const handleSiteSave = () => {
    saveSiteSettings.mutate(siteSettings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administra la configuración general del sitio web
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="h-4 w-4 mr-2" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="localization">
            <Globe className="h-4 w-4 mr-2" />
            Regional
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración General del Sitio</CardTitle>
              <CardDescription>
                Información básica y configuración del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site_name">Nombre del Sitio</Label>
                  <Input
                    id="site_name"
                    value={siteSettings.site_name}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, site_name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contact_email">Email de Contacto</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={siteSettings.contact_email}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, contact_email: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="site_description">Descripción del Sitio</Label>
                <Input
                  id="site_description"
                  value={siteSettings.site_description}
                  onChange={(e) => setSiteSettings(prev => ({ ...prev, site_description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="social_facebook">Facebook</Label>
                  <Input
                    id="social_facebook"
                    placeholder="https://facebook.com/..."
                    value={siteSettings.social_facebook}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, social_facebook: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="social_instagram">Instagram</Label>
                  <Input
                    id="social_instagram"
                    placeholder="https://instagram.com/..."
                    value={siteSettings.social_instagram}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, social_instagram: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="social_youtube">YouTube</Label>
                  <Input
                    id="social_youtube"
                    placeholder="https://youtube.com/..."
                    value={siteSettings.social_youtube}
                    onChange={(e) => setSiteSettings(prev => ({ ...prev, social_youtube: e.target.value }))}
                  />
                </div>
              </div>

              <Button onClick={handleSiteSave} disabled={saveSiteSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveSiteSettings.isPending ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="theme" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Tema</CardTitle>
              <CardDescription>
                Personaliza los colores y tipografía del sitio web
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Color Primario</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="primary_color"
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                    />
                    <input
                      type="color"
                      value={themeSettings.primary_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-12 h-10 border border-input rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="accent_color">Color de Acento</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="accent_color"
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                    />
                    <input
                      type="color"
                      value={themeSettings.accent_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, accent_color: e.target.value }))}
                      className="w-12 h-10 border border-input rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background_color">Color de Fondo</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="background_color"
                      value={themeSettings.background_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, background_color: e.target.value }))}
                    />
                    <input
                      type="color"
                      value={themeSettings.background_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, background_color: e.target.value }))}
                      className="w-12 h-10 border border-input rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="text_color">Color de Texto</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="text_color"
                      value={themeSettings.text_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, text_color: e.target.value }))}
                    />
                    <input
                      type="color"
                      value={themeSettings.text_color}
                      onChange={(e) => setThemeSettings(prev => ({ ...prev, text_color: e.target.value }))}
                      className="w-12 h-10 border border-input rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="font_family">Familia de Fuente</Label>
                <Input
                  id="font_family"
                  value={themeSettings.font_family}
                  onChange={(e) => setThemeSettings(prev => ({ ...prev, font_family: e.target.value }))}
                  placeholder="Inter, Arial, sans-serif"
                />
              </div>

              <Button onClick={handleThemeSave} disabled={saveThemeSettings.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {saveThemeSettings.isPending ? 'Guardando...' : 'Guardar Tema'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="localization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Regional</CardTitle>
              <CardDescription>
                Configuración de zona horaria, moneda y formato de fecha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground py-8">
                <Globe className="h-12 w-12 mx-auto mb-4" />
                <p>Configuración regional próximamente disponible</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;