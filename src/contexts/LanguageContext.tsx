import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLanguages, getDefaultLanguage } from '@/lib/supabase-helpers';

interface Language {
  id: number;
  code: string;
  name: string;
  is_default: boolean;
}

interface LanguageContextType {
  currentLanguage: Language | null;
  languages: Language[];
  setCurrentLanguage: (language: Language) => void;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);

  const { data: languages = [], isLoading } = useQuery({
    queryKey: ['languages'],
    queryFn: getLanguages,
  });

  const { data: defaultLanguage } = useQuery({
    queryKey: ['default-language'],
    queryFn: getDefaultLanguage,
  });

  useEffect(() => {
    // Check localStorage for saved language preference
    const savedLanguageCode = localStorage.getItem('preferred-language');
    
    if (savedLanguageCode && languages.length > 0) {
      const savedLanguage = languages.find(lang => lang.code === savedLanguageCode);
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
        return;
      }
    }

    // Fallback to default language
    if (defaultLanguage && !currentLanguage) {
      setCurrentLanguage(defaultLanguage);
    }
  }, [languages, defaultLanguage, currentLanguage]);

  const handleSetCurrentLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language.code);
  };

  const value = {
    currentLanguage,
    languages,
    setCurrentLanguage: handleSetCurrentLanguage,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};