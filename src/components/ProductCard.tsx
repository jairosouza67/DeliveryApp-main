import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { getPriceReference, getProductMetaLines, getSourceSectionLabel } from "@/lib/productMetadata";
import { Plus, Package, AlertTriangle } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  type: string;
  price: number;
  volume?: string;
  imageUrl?: string;
  inStock: boolean;
  stockQuantity?: number;
  currencyCode?: string | null;
  brand?: string | null;
  volumeLabel?: string | null;
  packageType?: string | null;
  alcoholic?: boolean | null;
  sourceSection?: string | null;
  priceReferenceLabel?: string | null;
  priceSource?: string | null;
  onAddToCart: () => void;
}

export const ProductCard = ({
  id,
  name,
  type,
  price,
  volume,
  imageUrl,
  inStock,
  stockQuantity,
  currencyCode,
  brand,
  volumeLabel,
  packageType,
  alcoholic,
  sourceSection,
  priceReferenceLabel,
  priceSource,
  onAddToCart,
}: ProductCardProps) => {
  // Determine stock status
  const getStockStatus = () => {
    if (!inStock || stockQuantity === 0) {
      return { label: "Indisponível", variant: "destructive" as const, canBuy: false };
    }
    if (stockQuantity && stockQuantity <= 5) {
      return { label: `Últimas ${stockQuantity} un.`, variant: "secondary" as const, canBuy: true };
    }
    return { label: "Disponível", variant: "default" as const, canBuy: true };
  };

  const stockStatus = getStockStatus();
  const metaLines = getProductMetaLines({
    type,
    brand,
    volume_label: volumeLabel ?? volume,
    package_type: packageType,
    alcoholic,
  }).slice(0, 3);
  const sourceLabel = getSourceSectionLabel({ type, source_section: sourceSection });
  const referenceLabel = getPriceReference({ type, price_reference_label: priceReferenceLabel, price_source: priceSource });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };

  return (
    <Link to={`/produto/${id}`} className="block h-full">
      <Card className="ticket-card group flex h-full cursor-pointer flex-col overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/4.2] overflow-hidden bg-muted/50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-card">
              <Package className="w-16 h-16 text-muted-foreground/30" />
            </div>
          )}

          <Badge
            variant={stockStatus.variant}
            className="absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]"
          >
            {stockStatus.label}
          </Badge>

          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <CardContent className="flex-1 space-y-3 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {type}
          </p>

          <h3 className="line-clamp-2 text-2xl leading-tight text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>

          {volume && (
            <p className="text-sm text-muted-foreground">{volume}</p>
          )}

          {metaLines.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metaLines.map((metaLine) => (
                <span
                  key={metaLine}
                  className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                >
                  {metaLine}
                </span>
              ))}
            </div>
          )}

          {sourceLabel && (
            <p className="text-xs leading-5 text-muted-foreground">Seção original: {sourceLabel}</p>
          )}

          <div className="editorial-divider" />

          <div className="flex items-end justify-between gap-4 pt-1">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Preço</p>
              <span className="mt-2 block text-3xl font-semibold leading-none text-primary">
                {formatCurrency(price, currencyCode ?? "EUR")}
              </span>
              {referenceLabel && (
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {referenceLabel}
                </p>
              )}
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Pronta entrega
            </span>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Button
            onClick={handleAddToCart}
            disabled={!stockStatus.canBuy}
            className="h-12 w-full gap-2 rounded-full"
            variant={stockStatus.canBuy ? "default" : "secondary"}
          >
            {stockStatus.canBuy ? (
              <>
                <Plus className="w-4 h-4" />
                Adicionar
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                Indisponível
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};
