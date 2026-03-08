import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, MapPin, Percent, ShieldCheck, Sparkles, Truck, Zap } from "lucide-react";

export const Hero = () => {
  const metrics = [
    { label: "Min médio", value: "35", note: "do clique até a entrega" },
    { label: "Rótulos", value: "+120", note: "entre cervejas, vinhos e destilados" },
    { label: "Cobertura", value: "3 zonas", note: "atendimento com rota própria" },
  ];

  return (
    <section className="relative overflow-hidden pb-12 pt-8 md:pb-20 md:pt-12">
      <div className="absolute left-0 top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="container relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8 animate-fade-in">
            <div className="section-kicker">
              <Percent className="h-3.5 w-3.5 text-primary" />
              Primeira compra com 10% off
            </div>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-[0.95] text-foreground md:text-7xl xl:text-[5.4rem]">
                Delivery com cara de
                <span className="block bg-gradient-hero bg-clip-text text-transparent">
                  noite bem servida
                </span>
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                Cervejas geladas, vinhos com presença, destilados para ocasião e uma vitrine montada para parecer marca de verdade, não template reciclado.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="h-14 rounded-full px-8 text-base font-semibold">
                <Link to="/catalogo">
                  <Zap className="h-5 w-5" />
                  Abrir catálogo
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 rounded-full border-border/80 bg-card/80 px-8 text-base">
                <Link to="/contato">
                  Falar com a equipe
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-tile">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-3 text-4xl font-semibold leading-none text-foreground">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.note}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-muted-foreground">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Rota própria para pedidos rápidos
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Curadoria e estoque com reposição diária
              </div>
            </div>
          </div>

          <div className="hero-panel noise-surface p-5 md:p-7">
            <div className="relative z-10 space-y-5">
              <div className="flex items-center justify-between rounded-[1.5rem] border border-border/60 bg-card/80 px-5 py-4 backdrop-blur">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Operação ao vivo</p>
                  <p className="mt-2 font-display text-3xl text-foreground">Gelada, rápida, sem improviso</p>
                </div>
                <Sparkles className="h-8 w-8 text-primary float-slow" />
              </div>

              <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[1.75rem] bg-secondary p-6 text-secondary-foreground shadow-elegant">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-secondary-foreground/60">Seleção da casa</p>
                  <p className="mt-3 font-display text-4xl leading-none">Combo de sexta</p>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-secondary-foreground/78">
                    Packs frios, energético para mix e um vinho de entrada que não parece escolha automática.
                  </p>
                  <div className="editorial-divider my-6 bg-white/15" />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white/8 p-4">
                      <p className="text-secondary-foreground/58">Tempo estimado</p>
                      <p className="mt-2 text-xl font-semibold">25-40 min</p>
                    </div>
                    <div className="rounded-2xl bg-white/8 p-4">
                      <p className="text-secondary-foreground/58">Pedido mínimo</p>
                      <p className="mt-2 text-xl font-semibold">R$ 20</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-border/60 bg-card/75 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-primary/12 p-3">
                        <Clock3 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Janela ideal</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">Pico entre 18h e 21h</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-border/60 bg-card/75 p-5">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-accent/12 p-3">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Cobertura atual</p>
                        <p className="mt-1 text-lg font-semibold text-foreground">Centro, Sul e Oeste</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-dashed border-primary/40 bg-primary/8 p-5">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-primary">Atenção ao detalhe</p>
                    <p className="mt-3 text-sm leading-7 text-foreground/78">
                      Visual pensado para parecer operação premium de bairro, com energia de bar e não de landing page genérica.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
