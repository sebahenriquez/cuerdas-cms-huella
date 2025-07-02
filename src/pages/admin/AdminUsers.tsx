import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Edit, Plus, Trash2, Users, Shield, UserCheck, UserX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CMSUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cms_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as CMSUser[];
    }
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('cms_users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Usuario eliminado',
        description: 'El usuario ha sido eliminado correctamente.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario.',
        variant: 'destructive',
      });
    }
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { error } = await supabase
        .from('cms_users')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Rol actualizado',
        description: 'El rol del usuario ha sido actualizado.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el rol del usuario.',
        variant: 'destructive',
      });
    }
  });

  const handleDelete = (userId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      deleteUser.mutate(userId);
    }
  };

  const handleRoleToggle = (user: CMSUser) => {
    const newRole = user.role === 'admin' ? 'editor' : 'admin';
    updateUserRole.mutate({ userId: user.id, role: newRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'editor':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <UserX className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'default';
      case 'editor':
        return 'secondary';
      default:
        return 'outline';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema CMS
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/users/new">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-3">
                    {getRoleIcon(user.role)}
                    <span>{user.email}</span>
                    <Badge variant={getRoleColor(user.role)}>
                      {user.role === 'admin' ? 'Administrador' : 'Editor'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Creado: {new Date(user.created_at).toLocaleDateString()} • 
                    Actualizado: {new Date(user.updated_at).toLocaleDateString()}
                  </CardDescription>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleToggle(user)}
                    disabled={updateUserRole.isPending}
                  >
                    {user.role === 'admin' ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Hacer Editor
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-1" />
                        Hacer Admin
                      </>
                    )}
                  </Button>

                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/users/${user.id}/edit`}>
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    disabled={deleteUser.isPending}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Información</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>ID: {user.id.substring(0, 8)}...</p>
                    <p>Email: {user.email}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Permisos</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Rol: {user.role === 'admin' ? 'Administrador' : 'Editor'}</p>
                    <p>Acceso: {user.role === 'admin' ? 'Completo' : 'Limitado'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Estado</h4>
                  <Badge variant="default">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay usuarios</h3>
            <p className="text-muted-foreground mb-4">
              Agrega usuarios para gestionar el acceso al CMS.
            </p>
            <Button asChild>
              <Link to="/admin/users/new">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Usuario
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminUsers;