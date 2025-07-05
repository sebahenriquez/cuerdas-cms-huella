
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrackSettingsFormProps {
  orderPosition: number;
  audioUrl: string;
  status: string;
  onOrderPositionChange: (value: number) => void;
  onAudioUrlChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const TrackSettingsForm: React.FC<TrackSettingsFormProps> = ({
  orderPosition,
  audioUrl,
  status,
  onOrderPositionChange,
  onAudioUrlChange,
  onStatusChange
}) => {
  return (
    <Card>
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
            value={orderPosition || ''}
            onChange={(e) => onOrderPositionChange(parseInt(e.target.value) || 1)}
            placeholder="1"
          />
        </div>
        
        <div>
          <Label htmlFor="audio_url">URL del Audio</Label>
          <Input
            id="audio_url"
            value={audioUrl || ''}
            onChange={(e) => onAudioUrlChange(e.target.value)}
            placeholder="https://ejemplo.com/audio.mp3"
          />
        </div>

        <div>
          <Label htmlFor="status">Estado</Label>
          <Select
            value={status || ''}
            onValueChange={onStatusChange}
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
      </CardContent>
    </Card>
  );
};

export default TrackSettingsForm;
