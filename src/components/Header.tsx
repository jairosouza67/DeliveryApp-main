import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Beer, Clock, Lock, Sparkles } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/catalogo", label: "Catálogo" },
    { path: "/contato", label: "Contato" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65">
      <div className="border-b border-border/50 bg-secondary text-secondary-foreground">
        <div className="container flex h-10 items-center justify-between gap-3 text-[11px] font-medium uppercase tracking-[0.22em]">
          <div className="flex items-center gap-2 text-secondary-foreground/78">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Curadoria de rótulos, gelados e combos prontos para a noite</span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-secondary-foreground/68">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>Aberto hoje das 10h às 22h</span>
          </div>
        </div>
      </div>

      <div className="container flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="rounded-2xl bg-gradient-hero p-3 shadow-glow transition-transform group-hover:scale-[1.03]">
            <Beer className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold leading-none text-foreground">
              BebeMais
            </span>
            <span className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground hidden sm:block">
              Delivery de bebidas com identidade
            </span>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-3 rounded-full border border-border/80 bg-card/85 px-4 py-2 shadow-elegant">
          <div className="h-2.5 w-2.5 rounded-full bg-primary promo-badge" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Entrega expressa em regiões selecionadas
          </span>
        </div>

        <nav className="hidden md:flex items-center rounded-full border border-border/80 bg-card/85 p-1 shadow-elegant">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-pill text-sm font-semibold ${isActive(link.path) ? "nav-pill-active" : ""}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CartDrawer />

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Link to="/admin/dashboard">
                <Button variant="outline" size="sm" className="gap-2 rounded-full border-border/80 bg-card/80 px-4">
                  <Lock className="h-3.5 w-3.5" />
                  Painel
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full text-muted-foreground hover:text-destructive"
                onClick={() => signOut()}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sair
              </Button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="outline" size="sm" className="gap-2 rounded-full border-border/80 bg-card/80 px-4">
                <Lock className="h-3.5 w-3.5" />
                Área Restrita
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-border/60 bg-background/95 animate-fade-in md:hidden">
          <nav className="container space-y-2 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition-colors ${isActive(link.path)
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-muted"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
                >
                  <Lock className="h-4 w-4" />
                  Painel Administrativo
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sair da Conta
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                <Lock className="h-4 w-4" />
                Área Restrita
              </Link>
            )}

            <div className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>Horário: 10h às 22h</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
