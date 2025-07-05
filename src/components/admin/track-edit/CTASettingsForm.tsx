
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TrackCTASettings {
  show_texts: boolean;
  show_videos: boolean;
  show_photos: boolean;
  texts_label_es?: string;
  texts_label_en?: string;
  videos_label_es?: string;
  videos_label_en?: string;
  photos_label_es?: string;
  photos_label_en?: string;
}

interface CTASettingsFormProps {
  ctaSettings: TrackCTASettings;
  onCTASettingsChange: (settings: Partial<TrackCTASettings>) => void;
}

const CTASettingsForm: React.FC<CTASettingsFormProps> = ({
  ctaSettings,
  onCTASettingsChange
}) => {
  return (
    <div className="border-t pt-4">
      <Label className="text-sm font-medium mb-3 block">Configuración de Botones CTA</Label>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show_texts"
            checked={ctaSettings?.show_texts || false}
            onCheckedChange={(checked) => {
              onCTASettingsChange({
                show_texts: checked as boolean
              });
            }}
          />
          <Label htmlFor="show_texts" className="text-sm">Mostrar Textos</Label>
        </div>

        {ctaSettings?.show_texts && (
          <div className="grid grid-cols-2 gap-2 ml-6">
            <Input
              placeholder="Texto ES"
              value={ctaSettings?.texts_label_es || ''}
              onChange={(e) => {
                onCTASettingsChange({
                  texts_label_es: e.target.value
                });
              }}
            />
            <Input
              placeholder="Texto EN"
              value={ctaSettings?.texts_label_en || ''}
              onChange={(e) => {
                onCTASettingsChange({
                  texts_label_en: e.target.value
                });
              }}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="show_videos"
            checked={ctaSettings?.show_videos || false}
            onCheckedChange={(checked) => {
              onCTASettingsChange({
                show_videos: checked as boolean
              });
            }}
          />
          <Label htmlFor="show_videos" className="text-sm">Mostrar Videos</Label>
        </div>

        {ctaSettings?.show_videos && (
          <div className="grid grid-cols-2 gap-2 ml-6">
            <Input
              placeholder="Videos ES"
              value={ctaSettings?.videos_label_es || ''}
              onChange={(e) => {
                onCTASettingsChange({
                  videos_label_es: e.target.value
                });
              }}
            />
            <Input
              placeholder="Videos EN"
              value={ctaSettings?.videos_label_en || ''}
              onChange={(e) => {
                onCTASettingsChange({
                  videos_label_en: e.target.value
                });
              }}
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="show_photos"
            checked={ctaSettings?.show_photos || false}
            onCheckedChange={(checked) => {
              onCTASettingsChange({
                show_photos: checked as boolean
              });
            }}
          />
          <Label htmlFor="show_photos" className="text-sm">Mostrar Fotos</Label>
        </div>

        {ctaSettings?.show_photos && (
          <div className="grid grid-cols-2 gap-2 ml-6">
            <Input
              placeholder="Fotos ES"
              value={ctaSettings?.photos_label_es || ''}
              onChange={(e) => {
                onCTASettingsChange({
                  photos_label_es: e.target.value
                });
              }}
            />
            <Input
              placeholder="Fotos EN"
              value={ctaSettings?.photos_label_en || ''}
              onChange={(e) => {
                onCTASettingsChange({
                  photos_label_en: e.target.value
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CTASettingsForm;
