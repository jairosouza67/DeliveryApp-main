import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { ProductCategories } from "@/components/ProductCategories";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MobileNav } from "@/components/MobileNav";
import { ArrowRight, Flame, Gift, MessageCircle, Sparkles, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { getFeaturedProductsCached, refreshFeaturedProducts } from "@/lib/productsApi";

interface Product {
  id: string;
  name: string;
  type: string;
  price: number;
  in_stock: boolean;
  image_url?: string;
}

const Index = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(() => {
    return (getFeaturedProductsCached() as Product[] | null) ?? [];
  });
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    refreshFeaturedProducts()
      .then((fresh) => {
        if (cancelled) return;
        setFeaturedProducts(fresh as Product[]);
      })
      .catch(() => {
        // Silencioso: home continua funcionando mesmo sem destaques.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      type: product.type,
      price: product.price,
    });
    toast({
      title: "Produto adicionado! 🍺",
      description: `${product.name} foi adicionado ao carrinho.`,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pb-20 md:pb-0">
        <Hero />

        <section className="pb-4">
          <div className="container">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="section-shell p-6 md:p-7">
                <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <div className="max-w-xl space-y-3">
                    <div className="section-kicker">Diferencial real</div>
                    <h2 className="text-3xl text-foreground md:text-4xl">
                      A home agora fala como marca local premium, não como marketplace genérico.
                    </h2>
                  </div>
                  <p className="max-w-md text-sm leading-7 text-muted-foreground md:text-base">
                    Menos bloco repetido, mais ritmo visual: informação útil, contraste forte e seções que contam uma história de compra.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  { icon: Truck, label: "Entrega", value: "até 40 min" },
                  { icon: Sparkles, label: "Curadoria", value: "combos prontos" },
                  { icon: MessageCircle, label: "Atendimento", value: "WhatsApp direto" },
                ].map((item) => (
                  <div key={item.label} className="ticket-card p-5">
                    <item.icon className="h-5 w-5 text-primary" />
                    <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <ProductCategories />

        {featuredProducts.length > 0 && (
          <section className="py-16">
            <div className="container">
              <div className="inverse-panel px-6 py-8 md:px-10 md:py-10">
                <div className="relative z-10 mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Flame className="h-5 w-5 text-primary" />
                      <Badge variant="secondary" className="rounded-full border border-white/10 bg-white/10 px-3 text-primary">
                        Mais pedidos agora
                      </Badge>
                    </div>
                    <h2 className="text-4xl text-white md:text-5xl">Os rótulos que estão girando mais rápido</h2>
                    <p className="max-w-2xl text-base leading-7 text-white/74 md:text-lg">
                      Seleção viva da operação. O bloco escuro destaca o catálogo mais quente e quebra a monotonia visual da página.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="h-12 rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/catalogo">
                      Ver catálogo inteiro
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {featuredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      type={product.type}
                      price={product.price}
                      imageUrl={product.image_url}
                      inStock={product.in_stock}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-8 md:py-16">
          <div className="container">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="ticket-card border-0">
                <CardContent className="flex min-h-[260px] flex-col justify-between p-8 md:p-10">
                  <div className="space-y-4">
                    <Badge className="w-fit rounded-full bg-primary/12 px-3 text-primary hover:bg-primary/18">
                      <Gift className="w-3 h-3 mr-1" />
                      Oferta da semana
                    </Badge>
                    <h3 className="text-4xl text-foreground md:text-5xl">Compre 6, leve 8</h3>
                    <p className="max-w-lg text-base leading-7 text-muted-foreground">
                      Em cervejas selecionadas, com destaque visual suficiente para parecer campanha e não banner padrão colado na home.
                    </p>
                  </div>
                  <Button asChild className="mt-6 h-12 w-fit rounded-full px-6">
                    <Link to="/catalogo?categoria=cervejas">Ver cervejas</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="inverse-panel border-0">
                <CardContent className="relative z-10 flex min-h-[260px] flex-col justify-between p-8 md:p-10">
                  <div className="space-y-4">
                    <Badge className="w-fit rounded-full bg-white/10 px-3 text-white hover:bg-white/15">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Seleção de vinhos
                    </Badge>
                    <h3 className="text-4xl text-white md:text-5xl">20% OFF em vinhos</h3>
                    <p className="max-w-lg text-base leading-7 text-white/76">
                      Tintos, brancos e rosés organizados como coleção de verdade, com contraste mais forte e leitura melhor.
                    </p>
                  </div>
                  <Button asChild variant="outline" className="mt-6 h-12 w-fit rounded-full border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
                    <Link to="/catalogo?categoria=vinhos">Ver vinhos</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container">
            <div className="section-shell overflow-hidden px-6 py-10 md:px-10 md:py-12">
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="space-y-4">
                  <div className="section-kicker">Pronto para pedir</div>
                  <h2 className="text-4xl text-foreground md:text-5xl">Seu carrinho pode parecer tão bem montado quanto a vitrine.</h2>
                  <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                    A próxima etapa é manter esse mesmo nível visual nas páginas internas, mas a linguagem principal da marca já saiu do território de site genérico.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
                <Button asChild size="lg" className="h-14 rounded-full px-8 text-base">
                  <Link to="/catalogo">Ver Catálogo Completo</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-border/80 bg-card/70 px-8 text-base">
                  <Link to="/contato">Falar no WhatsApp</Link>
                </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
};

export default Index;
