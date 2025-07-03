
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import RichTextEditor from '@/components/admin/RichTextEditor';
import { ArrowLeft, Save, Play, Pause, Plus, X, Video, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getLanguages } from '@/lib/supabase-helpers';
import { useAudioPlayer } from '@/contexts/AudioPlayerContext';

interface TrackContent {
  id?: number;
  title: string;
  menu_title: string;
  description: string;
  long_text_content: string;
  hero_image_url: string;
  language_id: number;
}

interface VideoContent {
  id?: number;
  title: string;
  description: string;
  language_id: number;
}

interface VideoData {
  id?: number;
  vimeo_url: string;
  thumbnail_url?: string;
  order_position: number;
  video_contents?: VideoContent[];
}

interface PhotoData {
  id?: number;
  media_file_id?: number;
  caption_es: string;
  caption_en: string;
  order_position: number;
  image_url?: string;
}

interface TrackData {
  id: number;
  order_position: number;
  audio_url: string;
  status: string;
  track_contents: TrackContent[];
  videos?: VideoData[];
  photos?: PhotoData[];
  track_featured_images?: any[];
}

const AdminTrackEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useAudioPlayer();
  const trackId = parseInt(id || '0');

  const [trackData, setTrackData] = useState<Partial<TrackData>>({
    order_position: 1,
    audio_url: '',
    status: 'published',
    track_contents: [],
    videos: [],
    photos: []
  });

  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages
  });

  const { data: existingTrack, isLoading } = useQuery({
    queryKey: ['track', trackId],
    queryFn: async () => {
      if (trackId === 0) return null;
      
      const { data, error } = await supabase
        .from('tracks')
        .select(`
          *,
          track_contents(*),
          videos(*, video_contents(*)),
          track_featured_images(*)
        `)
        .eq('id', trackId)
        .single();
      
      if (error) throw error;
      return data as TrackData;
    },
    enabled: trackId > 0
  });

  useEffect(() => {
    if (existingTrack) {
      // Transform the data to match our interface
      const transformedTrack = {
        ...existingTrack,
        videos: existingTrack.videos?.map(video => ({
          ...video,
          video_contents: video.video_contents || languages.map(lang => ({
            title: '',
            description: '',
            language_id: lang.id
          }))
        })) || [],
        photos: existingTrack.track_featured_images?.map(photo => ({
          ...photo,
          image_url: '' // You might want to construct this from media_file_id
        })) || []
      };
      setTrackData(transformedTrack);
    } else if (languages.length > 0 && trackData.track_contents.length === 0) {
      // Initialize empty content for all languages
      setTrackData(prev => ({
        ...prev,
        track_contents: languages.map(lang => ({
          title: '',
          menu_title: '',
          description: '',
          long_text_content: '',
          hero_image_url: '',
          language_id: lang.id
        }))
      }));
    }
  }, [existingTrack, languages]);

  const saveTrack = useMutation({
    mutationFn: async (data: Partial<TrackData>) => {
      if (trackId > 0) {
        // Update existing track
        const { error: trackError } = await supabase
          .from('tracks')
          .update({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .eq('id', trackId);

        if (trackError) throw trackError;

        // Update or insert track contents
        for (const content of data.track_contents || []) {
          if (content.id) {
            const { error } = await supabase
              .from('track_contents')
              .update(content)
              .eq('id', content.id);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('track_contents')
              .insert({
                ...content,
                track_id: trackId
              });
            if (error) throw error;
          }
        }

        // Handle videos
        if (data.videos) {
          // Delete existing videos not in the new list
          const currentVideoIds = data.videos.filter(v => v.id).map(v => v.id);
          if (currentVideoIds.length > 0) {
            const { error } = await supabase
              .from('videos')
              .delete()
              .eq('track_id', trackId)
              .not('id', 'in', `(${currentVideoIds.join(',')})`);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('videos')
              .delete()
              .eq('track_id', trackId);
            if (error) throw error;
          }

          // Update or insert videos
          for (const video of data.videos) {
            if (video.id) {
              // Update existing video
              const { error } = await supabase
                .from('videos')
                .update({
                  vimeo_url: video.vimeo_url,
                  thumbnail_url: video.thumbnail_url,
                  order_position: video.order_position
                })
                .eq('id', video.id);
              if (error) throw error;

              // Update video contents
              for (const content of video.video_contents || []) {
                if (content.id) {
                  const { error: contentError } = await supabase
                    .from('video_contents')
                    .update({
                      title: content.title,
                      description: content.description
                    })
                    .eq('id', content.id);
                  if (contentError) throw contentError;
                } else {
                  const { error: contentError } = await supabase
                    .from('video_contents')
                    .insert({
                      video_id: video.id,
                      language_id: content.language_id,
                      title: content.title,
                      description: content.description
                    });
                  if (contentError) throw contentError;
                }
              }
            } else {
              // Create new video
              const { data: newVideo, error } = await supabase
                .from('videos')
                .insert({
                  track_id: trackId,
                  vimeo_url: video.vimeo_url,
                  thumbnail_url: video.thumbnail_url,
                  order_position: video.order_position
                })
                .select()
                .single();
              if (error) throw error;

              // Insert video contents
              for (const content of video.video_contents || []) {
                const { error: contentError } = await supabase
                  .from('video_contents')
                  .insert({
                    video_id: newVideo.id,
                    language_id: content.language_id,
                    title: content.title,
                    description: content.description
                  });
                if (contentError) throw contentError;
              }
            }
          }
        }

        // Handle photos
        if (data.photos) {
          // Delete existing photos not in the new list
          const currentPhotoIds = data.photos.filter(p => p.id).map(p => p.id);
          if (currentPhotoIds.length > 0) {
            const { error } = await supabase
              .from('track_featured_images')
              .delete()
              .eq('track_id', trackId)
              .not('id', 'in', `(${currentPhotoIds.join(',')})`);
            if (error) throw error;
          } else {
            const { error } = await supabase
              .from('track_featured_images')
              .delete()
              .eq('track_id', trackId);
            if (error) throw error;
          }

          // Update or insert photos
          for (const photo of data.photos) {
            if (photo.id) {
              const { error } = await supabase
                .from('track_featured_images')
                .update({
                  caption_es: photo.caption_es,
                  caption_en: photo.caption_en,
                  order_position: photo.order_position
                })
                .eq('id', photo.id);
              if (error) throw error;
            } else {
              const { error } = await supabase
                .from('track_featured_images')
                .insert({
                  track_id: trackId,
                  caption_es: photo.caption_es,
                  caption_en: photo.caption_en,
                  order_position: photo.order_position
                });
              if (error) throw error;
            }
          }
        }
      } else {
        // Create new track
        const { data: newTrack, error: trackError } = await supabase
          .from('tracks')
          .insert({
            order_position: data.order_position,
            audio_url: data.audio_url,
            status: data.status
          })
          .select()
          .single();

        if (trackError) throw trackError;

        // Insert track contents
        for (const content of data.track_contents || []) {
          const { error } = await supabase
            .from('track_contents')
            .insert({
              ...content,
              track_id: newTrack.id
            });
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-es'] });
      queryClient.invalidateQueries({ queryKey: ['admin-tracks-en'] });
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      toast({
        title: 'Track guardado',
        description: 'Los cambios han sido guardados correctamente.',
      });
      navigate('/admin/tracks');
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los cambios.',
        variant: 'destructive',
      });
      console.error('Error saving track:', error);
    }
  });

  const updateTrackContent = (languageId: number, field: keyof TrackContent, value: string) => {
    setTrackData(prev => ({
      ...prev,
      track_contents: prev.track_contents?.map(content =>
        content.language_id === languageId
          ? { ...content, [field]: value }
          : content
      ) || []
    }));
  };

  const updateVideoContent = (videoIndex: number, languageId: number, field: keyof VideoContent, value: string) => {
    setTrackData(prev => ({
      ...prev,
      videos: prev.videos?.map((video, index) => 
        index === videoIndex ? {
          ...video,
          video_contents: video.video_contents?.map(content => 
            content.language_id === languageId 
              ? { ...content, [field]: value }
              : content
          )
        } : video
      )
    }));
  };

  const handleSave = () => {
    saveTrack.mutate(trackData);
  };

  const handlePlayPause = () => {
    if (!trackData.audio_url) {
      toast({
        title: 'Sin audio',
        description: 'Agrega una URL de audio para reproducir el track.',
        variant: 'destructive',
      });
      return;
    }

    const track = {
      id: trackId,
      order_position: trackData.order_position || 1,
      audio_url: trackData.audio_url,
      status: trackData.status || 'published',
      track_contents: trackData.track_contents || []
    };

    if (currentTrack?.id === trackId && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/admin/tracks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Tracks
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {trackId > 0 ? 'Editar Track' : 'Nuevo Track'}
            </h1>
            <p className="text-muted-foreground">
              {trackId > 0 ? `Editando Track ${trackData.order_position}` : 'Crear un nuevo track'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          {trackData.audio_url && (
            <Button variant="outline" onClick={handlePlayPause}>
              {currentTrack?.id === trackId && isPlaying ? (
                <Pause className="h-4 w-4 mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {currentTrack?.id === trackId && isPlaying ? 'Pausar' : 'Reproducir'}
            </Button>
          )}
          <Button onClick={handleSave} disabled={saveTrack.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {saveTrack.isPending ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Track Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Configuración del track</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="order_position">Posición</Label>
              <Input
                id="order_position"
                type="number"
                value={trackData.order_position || ''}
                onChange={(e) => setTrackData(prev => ({ ...prev, order_position: parseInt(e.target.value) || 1 }))}
                placeholder="1"
              />
            </div>
            
            <div>
              <Label htmlFor="audio_url">URL del Audio</Label>
              <Input
                id="audio_url"
                value={trackData.audio_url || ''}
                onChange={(e) => setTrackData(prev => ({ ...prev, audio_url: e.target.value }))}
                placeholder="https://ejemplo.com/audio.mp3"
              />
            </div>

            <div>
              <Label htmlFor="status">Estado</Label>
              <Select
                value={trackData.status || ''}
                onValueChange={(value) => setTrackData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Videos Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Videos (máx. 2)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if ((trackData.videos?.length || 0) < 2) {
                      setTrackData(prev => ({
                        ...prev,
                        videos: [
                          ...(prev.videos || []),
                          {
                            vimeo_url: '',
                            order_position: (prev.videos?.length || 0) + 1,
                            video_contents: languages.map(lang => ({
                              title: '',
                              description: '',
                              language_id: lang.id
                            }))
                          }
                        ]
                      }))
                    }
                  }}
                  disabled={(trackData.videos?.length || 0) >= 2}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {trackData.videos?.map((video, index) => (
                  <div key={index} className="border rounded p-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Video {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTrackData(prev => ({
                            ...prev,
                            videos: prev.videos?.filter((_, i) => i !== index)
                          }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="URL del Video (YouTube/Vimeo)"
                      value={video.vimeo_url}
                      onChange={(e) => {
                        setTrackData(prev => ({
                          ...prev,
                          videos: prev.videos?.map((v, i) => 
                            i === index ? { ...v, vimeo_url: e.target.value } : v
                          )
                        }))
                      }}
                    />
                    
                    {/* Video Content Fields - Now properly organized by language */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium">Contenido del Video</Label>
                      {languages.map((lang) => {
                        const content = video.video_contents?.find(c => c.language_id === lang.id);
                        return (
                          <div key={lang.id} className="border rounded p-3 space-y-2">
                            <Label className="text-xs text-muted-foreground font-medium">{lang.name}</Label>
                            <div className="space-y-2">
                              <Input
                                placeholder={`Título del video (${lang.code.toUpperCase()})`}
                                value={content?.title || ''}
                                onChange={(e) => updateVideoContent(index, lang.id, 'title', e.target.value)}
                              />
                              <Textarea
                                placeholder={`Descripción del video (${lang.code.toUpperCase()})`}
                                value={content?.description || ''}
                                rows={2}
                                onChange={(e) => updateVideoContent(index, lang.id, 'description', e.target.value)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos Section */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Fotos (máx. 8)
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if ((trackData.photos?.length || 0) < 8) {
                      setTrackData(prev => ({
                        ...prev,
                        photos: [
                          ...(prev.photos || []),
                          {
                            caption_es: '',
                            caption_en: '',
                            order_position: (prev.photos?.length || 0) + 1,
                            image_url: ''
                          }
                        ]
                      }))
                    }
                  }}
                  disabled={(trackData.photos?.length || 0) >= 8}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {trackData.photos?.map((photo, index) => (
                  <div key={index} className="border rounded p-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Foto {index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setTrackData(prev => ({
                            ...prev,
                            photos: prev.photos?.filter((_, i) => i !== index)
                          }))
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="URL de la imagen"
                      value={photo.image_url || ''}
                      onChange={(e) => {
                        setTrackData(prev => ({
                          ...prev,
                          photos: prev.photos?.map((p, i) => 
                            i === index ? { ...p, image_url: e.target.value } : p
                          )
                        }))
                      }}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Descripción (ES)"
                        value={photo.caption_es}
                        onChange={(e) => {
                          setTrackData(prev => ({
                            ...prev,
                            photos: prev.photos?.map((p, i) => 
                              i === index ? { ...p, caption_es: e.target.value } : p
                            )
                          }))
                        }}
                      />
                      <Input
                        placeholder="Descripción (EN)"
                        value={photo.caption_en}
                        onChange={(e) => {
                          setTrackData(prev => ({
                            ...prev,
                            photos: prev.photos?.map((p, i) => 
                              i === index ? { ...p, caption_en: e.target.value } : p
                            )
                          }))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Contenido</CardTitle>
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
                const content = trackData.track_contents?.find(c => c.language_id === language.id);
                
                return (
                  <TabsContent key={language.id} value={language.code} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${language.id}`}>Título</Label>
                        <Input
                          id={`title-${language.id}`}
                          value={content?.title || ''}
                          onChange={(e) => updateTrackContent(language.id, 'title', e.target.value)}
                          placeholder="Título del track"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`menu_title-${language.id}`}>Título del Menú</Label>
                        <Input
                          id={`menu_title-${language.id}`}
                          value={content?.menu_title || ''}
                          onChange={(e) => updateTrackContent(language.id, 'menu_title', e.target.value)}
                          placeholder="Título corto para menús"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor={`description-${language.id}`}>Descripción</Label>
                      <Textarea
                        id={`description-${language.id}`}
                        value={content?.description || ''}
                        onChange={(e) => updateTrackContent(language.id, 'description', e.target.value)}
                        placeholder="Descripción breve del track"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`long_text_content-${language.id}`}>Contenido Largo</Label>
                      <RichTextEditor
                        content={content?.long_text_content || ''}
                        onChange={(value) => updateTrackContent(language.id, 'long_text_content', value)}
                        placeholder="Contenido detallado del track"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`hero_image-${language.id}`}>Imagen Hero (URL)</Label>
                      <Input
                        id={`hero_image-${language.id}`}
                        value={content?.hero_image_url || ''}
                        onChange={(e) => updateTrackContent(language.id, 'hero_image_url', e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTrackEdit;
