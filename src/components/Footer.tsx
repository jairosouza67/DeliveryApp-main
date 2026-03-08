import { Link } from "react-router-dom";
import { Beer, MapPin, Clock, Phone, MessageCircle, Instagram, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pb-20 pt-8 text-secondary-foreground md:pb-0">
      <div className="container">
        <div className="inverse-panel px-6 py-10 md:px-10 md:py-12">
          <div className="relative z-10 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="rounded-2xl bg-primary p-3 text-primary-foreground shadow-glow">
                <Beer className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="font-display text-3xl text-white">BebeMais</span>
            </Link>
            <p className="max-w-sm text-sm leading-7 text-secondary-foreground/75">
              Delivery de bebidas com clima de marca local forte: menos aparência de template, mais sensação de operação real e cuidadosa.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full border border-white/10 hover:bg-primary/20">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full border border-white/10 hover:bg-primary/20">
                <Facebook className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Navegação</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-secondary-foreground/78 transition-colors hover:text-primary">
                Início
              </Link>
              <Link to="/catalogo" className="text-sm text-secondary-foreground/78 transition-colors hover:text-primary">
                Catálogo
              </Link>
              <Link to="/carrinho" className="text-sm text-secondary-foreground/78 transition-colors hover:text-primary">
                Carrinho
              </Link>
              <Link to="/contato" className="text-sm text-secondary-foreground/78 transition-colors hover:text-primary">
                Contato
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Horário de Funcionamento</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-secondary-foreground/78">
                  <p className="font-medium">Segunda a Sábado</p>
                  <p>10:00 às 22:00</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-secondary-foreground/78">
                  <p className="font-medium">Domingo e Feriados</p>
                  <p>12:00 às 20:00</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Contato</h4>
            <div className="space-y-3">
              <a
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-secondary-foreground/78 transition-colors hover:text-primary"
              >
                <MessageCircle className="h-5 w-5 text-green-500" />
                <span>WhatsApp: (11) 99999-9999</span>
              </a>
              <a
                href="tel:+5511999999999"
                className="flex items-center gap-3 text-sm text-secondary-foreground/78 transition-colors hover:text-primary"
              >
                <Phone className="h-5 w-5 text-primary" />
                <span>(11) 99999-9999</span>
              </a>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-secondary-foreground/78">
                  <p>Área de entrega:</p>
                  <p>Centro, Zona Sul, Zona Oeste</p>
                </div>
              </div>
            </div>
          </div>
        </div>

          <div className="editorial-divider mt-10 bg-white/10" />
          <div className="relative z-10 flex flex-col items-start justify-between gap-4 pt-6 text-sm text-secondary-foreground/62 sm:flex-row sm:items-center">
            <p>© {currentYear} BebeMais. Todos os direitos reservados.</p>
            <p className="uppercase tracking-[0.18em] text-secondary-foreground/48">
              Venda proibida para menores de 18 anos.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
