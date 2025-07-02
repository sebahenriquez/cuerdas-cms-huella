import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, Image as ImageIcon, File, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MediaFile {
  id: number;
  filename: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  alt_text: string | null;
  uploaded_at: string;
}

const AdminMedia: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: mediaFiles = [], isLoading } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('media_files')
        .select('*')
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as MediaFile[];
    }
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      const fileName = `${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media')
        .getPublicUrl(fileName);

      // Save to database
      const { data, error } = await supabase
        .from('media_files')
        .insert({
          filename: fileName,
          original_name: file.name,
          file_path: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          alt_text: null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast({
        title: 'Archivo subido',
        description: 'El archivo se ha subido correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al subir archivo',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const deleteFile = useMutation({
    mutationFn: async (mediaFile: MediaFile) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('media')
        .remove([mediaFile.filename]);

      if (storageError) throw storageError;

      // Delete from database
      const { error } = await supabase
        .from('media_files')
        .delete()
        .eq('id', mediaFile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast({
        title: 'Archivo eliminado',
        description: 'El archivo ha sido eliminado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo.',
        variant: 'destructive',
      });
    }
  });

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      uploadFile.mutate(file);
    });

    // Clear input
    event.target.value = '';
  }, [uploadFile]);

  const handleDelete = (mediaFile: MediaFile) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${mediaFile.original_name}"?`)) {
      deleteFile.mutate(mediaFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = (mimeType: string) => {
    return mimeType.startsWith('image/');
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copiada',
      description: 'La URL del archivo ha sido copiada al portapapeles.',
    });
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Media</h1>
          <p className="text-muted-foreground">
            Administra todos los archivos multimedia del sitio
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Archivos</CardTitle>
          <CardDescription>
            Sube imágenes, documentos y otros archivos multimedia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium">Haz clic para subir archivos</span>
              <p className="text-muted-foreground mt-2">
                o arrastra y suelta archivos aquí
              </p>
            </Label>
            <Input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
            <p className="text-xs text-muted-foreground mt-4">
              Formatos soportados: Imágenes, Videos, Audio, PDF, Word
            </p>
          </div>
          {uploadFile.isPending && (
            <div className="mt-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground mt-2">Subiendo archivos...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mediaFiles.map((file) => (
          <Card key={file.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {isImage(file.mime_type) ? (
                <img
                  src={file.file_path}
                  alt={file.alt_text || file.original_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <File className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium truncate" title={file.original_name}>
                {file.original_name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(file.file_size)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(file.uploaded_at).toLocaleDateString()}
              </p>
              
              <div className="flex space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(file.file_path)}
                  className="flex-1"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Copiar URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(file)}
                  disabled={deleteFile.isPending}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mediaFiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay archivos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza subiendo tu primer archivo multimedia.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminMedia;