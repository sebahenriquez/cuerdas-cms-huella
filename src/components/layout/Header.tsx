
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { getNavigation } from '@/lib/supabase-helpers';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageSelectorOpen, setIsLanguageSelectorOpen] = useState(false);
  const location = useLocation();
  const { currentLanguage, languages, setCurrentLanguage } = useLanguage();

  const { data: navigationItems = [] } = useQuery({
    queryKey: ['navigation', currentLanguage?.id],
    queryFn: () => currentLanguage ? getNavigation(currentLanguage.id) : [],
    enabled: !!currentLanguage,
  });

  const isActiveRoute = (url: string) => {
    return location.pathname === url;
  };

  const handleLanguageChange = (language: any) => {
    setCurrentLanguage(language);
    setIsLanguageSelectorOpen(false);
  };

  const getSiteTitle = () => {
    if (currentLanguage?.code === 'en') {
      return 'The Journey of Strings';
    }
    return 'La Huella de las Cuerdas';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-xl font-bold text-primary">
              {getSiteTitle()}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item: any) => (
              <Link
                key={item.id}
                to={item.url}
                className={`font-medium transition-colors hover:text-primary ${
                  isActiveRoute(item.url)
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-foreground'
                }`}
              >
                {item.navigation_contents[0]?.title}
              </Link>
            ))}
          </nav>

          {/* Language Selector & Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLanguageSelectorOpen(!isLanguageSelectorOpen)}
                className="language-selector"
              >
                <span className="text-lg mr-1">
                  {currentLanguage?.code === 'es' ? '🇪🇸' : '🇺🇸'}
                </span>
                {currentLanguage?.code.toUpperCase()}
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>

              {isLanguageSelectorOpen && (
                <div className="absolute right-0 top-full mt-2 w-32 bg-card border border-border rounded-lg shadow-lg">
                  {languages.map((language) => (
                    <button
                      key={language.id}
                      onClick={() => handleLanguageChange(language)}
                      className="w-full flex items-center px-3 py-2 text-sm hover:bg-muted rounded-lg"
                    >
                      <span className="text-lg mr-2">
                        {language.code === 'es' ? '🇪🇸' : '🇺🇸'}
                      </span>
                      {language.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item: any) => (
                <Link
                  key={item.id}
                  to={item.url}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 font-medium transition-colors hover:text-primary hover:bg-muted rounded-lg ${
                    isActiveRoute(item.url) ? 'text-primary bg-muted' : 'text-foreground'
                  }`}
                >
                  {item.navigation_contents[0]?.title}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
