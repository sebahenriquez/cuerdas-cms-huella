import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
import { supabase } from '@/integrations/supabase/client';

interface CMSUser {
  id: string;
  email: string;
  role: string;
}

interface CMSAuthContextType {
  user: CMSUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const CMSAuthContext = createContext<CMSAuthContextType | undefined>(undefined);

export const useCMSAuth = () => {
  const context = useContext(CMSAuthContext);
  if (!context) {
    throw new Error('useCMSAuth must be used within a CMSAuthProvider');
  }
  return context;
};

export const CMSAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CMSUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('cms-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('cms-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      // For the initial implementation, use hardcoded credentials
      if (email === 'adminS@lahuellaDelAsCuerdas.com' && password === 'S3b+4321') {
        const cmsUser: CMSUser = {
          id: '1',
          email: 'adminS@lahuellaDelAsCuerdas.com',
          role: 'admin'
        };
        
        setUser(cmsUser);
        localStorage.setItem('cms-user', JSON.stringify(cmsUser));
        return { success: true };
      }

      // Try to authenticate against database
      const { data: users, error } = await supabase
        .from('cms_users')
        .select('*')
        .eq('email', email);

      if (error) {
        return { success: false, error: 'Error de conexión' };
      }

      if (!users || users.length === 0) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      const dbUser = users[0];
      
      // For now, we'll implement a simple check since bcrypt hashing needs to be set up
      // In production, you'd use: const isValid = await bcrypt.compare(password, dbUser.password_hash);
      const isValid = password === 'S3b+4321'; // Temporary for demo

      if (!isValid) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      const cmsUser: CMSUser = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role
      };

      setUser(cmsUser);
      localStorage.setItem('cms-user', JSON.stringify(cmsUser));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error interno del servidor' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cms-user');
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <CMSAuthContext.Provider value={value}>
      {children}
    </CMSAuthContext.Provider>
  );
};