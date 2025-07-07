
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, RefreshCw } from 'lucide-react';

interface EmptyTracksStateProps {
  onRefresh: () => void;
}

export const EmptyTracksState: React.FC<EmptyTracksStateProps> = ({ onRefresh }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No hay tracks</h3>
        <p className="text-muted-foreground mb-4">
          Los tracks se cargan automáticamente desde la base de datos.
        </p>
        <Button onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Verificar conexión
        </Button>
      </CardContent>
    </Card>
  );
};
