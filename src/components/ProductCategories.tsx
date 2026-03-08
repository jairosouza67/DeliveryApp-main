import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beer, Wine, Martini, Coffee, Droplets, Package } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    icon: Beer,
    title: "Cervejas",
    description: "Pilsen, IPA, Lager, artesanais e importadas",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    link: "/catalogo?categoria=cervejas",
  },
  {
    icon: Wine,
    title: "Vinhos",
    description: "Tintos, brancos, rosés e espumantes",
    color: "text-rose-600",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
    link: "/catalogo?categoria=vinhos",
  },
  {
    icon: Martini,
    title: "Destilados",
    description: "Whisky, vodka, gin, rum e cachaça",
    color: "text-sky-500",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
    link: "/catalogo?categoria=destilados",
  },
  {
    icon: Coffee,
    title: "Drinks & Energéticos",
    description: "Bebidas prontas, energéticos e mixers",
    color: "text-orange-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
    link: "/catalogo?categoria=drinks",
  },
  {
    icon: Droplets,
    title: "Refrigerantes & Sucos",
    description: "Coca-Cola, Guaraná, sucos naturais",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950/30",
    link: "/catalogo?categoria=refrigerantes",
  },
  {
    icon: Package,
    title: "Combos & Promoções",
    description: "Kits especiais com desconto",
    color: "text-primary",
    bgColor: "bg-primary/10",
    link: "/catalogo?categoria=combos",
  },
];

export const ProductCategories = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="section-shell noise-surface px-6 py-8 md:px-10 md:py-10">
          <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="section-kicker">Categorias em destaque</div>
              <h2 className="text-4xl text-foreground md:text-5xl">
                A vitrine foi pensada por ocasião, não por bloco genérico.
              </h2>
            </div>
            <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              Cada entrada aponta para um clima diferente: resenha, jantar, presente, pré-festa ou reposição rápida no meio da semana.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category, index) => (
            <Link to={category.link} key={category.title}>
              <Card
                className={`ticket-card group h-full cursor-pointer animate-fade-in border-0 transition-all duration-300 hover:-translate-y-1 ${index === 0 || index === 5 ? "xl:col-span-2" : ""}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${category.bgColor} transition-transform group-hover:scale-110`}>
                    <category.icon className={`w-7 h-7 ${category.color}`} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <CardTitle className="text-2xl text-foreground transition-colors group-hover:text-primary">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <CardDescription className="text-base leading-7 text-muted-foreground">
                    {category.description}
                  </CardDescription>
                  <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-4 text-sm font-semibold text-foreground">
                    <span>Explorar seleção</span>
                    <span className="text-primary transition-transform group-hover:translate-x-1">→</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
