type ProductMetadataShape = {
  type: string;
  category_slug?: string | null;
  brand?: string | null;
  volume_label?: string | null;
  package_type?: string | null;
  alcoholic?: boolean | null;
  source_section?: string | null;
  source_store_name?: string | null;
  source_country_code?: string | null;
  source_dataset?: string | null;
  price_source?: string | null;
  price_reference_label?: string | null;
};

const knownCategoryMap: Record<string, string> = {
  cervejas: "cervejas",
  beers: "cervejas",
  vinhos: "vinhos",
  wine: "vinhos",
  wines: "vinhos",
  destilados: "destilados",
  spirits: "destilados",
  whisky: "destilados",
  whiskey: "destilados",
  vodka: "destilados",
  rum: "destilados",
  gin: "destilados",
  tequila: "destilados",
  mezcal: "destilados",
  drinks: "drinks",
  cocktails: "drinks",
  cocktail: "drinks",
  sodas: "refrigerantes",
  softdrinks: "refrigerantes",
  refrigerantes: "refrigerantes",
  water: "refrigerantes",
  juices: "refrigerantes",
  sucos: "refrigerantes",
  combos: "combos",
};

function normalizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

export function resolveCategorySlug(product: ProductMetadataShape): string {
  if (product.category_slug) return product.category_slug;

  const candidates = [product.type, product.source_section].filter(Boolean) as string[];
  for (const candidate of candidates) {
    const normalized = normalizeToken(candidate);
    if (knownCategoryMap[normalized]) {
      return knownCategoryMap[normalized];
    }
  }

  return normalizeToken(product.type || "bebidas") || "bebidas";
}

export function getProductMetaLines(product: ProductMetadataShape): string[] {
  const lines = [product.brand, product.volume_label, product.package_type].filter(Boolean) as string[];

  if (product.alcoholic === true) lines.push("Alcoólica");
  if (product.alcoholic === false) lines.push("Sem álcool");

  return lines;
}

export function getProductOrigin(product: ProductMetadataShape): string | null {
  const pieces = [product.source_store_name, product.source_country_code].filter(Boolean) as string[];
  return pieces.length > 0 ? pieces.join(" • ") : null;
}

export function getPriceReference(product: ProductMetadataShape): string | null {
  return product.price_reference_label ?? product.price_source ?? null;
}

export function getSourceSectionLabel(product: ProductMetadataShape): string | null {
  return product.source_section ?? null;
}