import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container-wide py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-lg font-bold text-primary mb-4">
              La Huella de las Cuerdas
            </h3>
            <p className="text-muted-foreground text-sm">
              Un viaje musical por la historia de los instrumentos de cuerda en América Latina.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/recorre-la-huella" className="text-muted-foreground hover:text-primary transition-colors">
                  Recorré la Huella
                </Link>
              </li>
              <li>
                <Link to="/escucha-la-huella" className="text-muted-foreground hover:text-primary transition-colors">
                  Escuchá la Huella
                </Link>
              </li>
              <li>
                <Link to="/videos" className="text-muted-foreground hover:text-primary transition-colors">
                  Videos
                </Link>
              </li>
              <li>
                <Link to="/acerca-de-berta-rojas" className="text-muted-foreground hover:text-primary transition-colors">
                  Acerca de Berta Rojas
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="font-semibold mb-4">Información</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/ficha-tecnica" className="hover:text-primary transition-colors">
                  Ficha Técnica
                </Link>
              </li>
              <li>
                <Link to="/prensa" className="hover:text-primary transition-colors">
                  Prensa
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} La Huella de las Cuerdas. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;