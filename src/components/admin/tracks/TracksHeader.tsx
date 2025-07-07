
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TracksHeaderProps {
  onRefresh: () => void;
}

export const TracksHeader: React.FC<TracksHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Tracks</h1>
        <p className="text-muted-foreground">
          Administra el contenido de todos los tracks del álbum
        </p>
      </div>
      <div className="flex space-x-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
        <Button asChild>
          <Link to="/admin/tracks/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Track
          </Link>
        </Button>
      </div>
    </div>
  );
};
