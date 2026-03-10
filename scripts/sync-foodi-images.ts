import { createClient } from "@supabase/supabase-js";
import { loadSupabaseEnv } from "./loadSupabaseEnv";

type ProductRow = {
  id: string;
  name: string;
  type: string;
  image_url: string | null;
  source_product_name: string | null;
  source_description: string | null;
  source_section: string | null;
  source_image_path: string | null;
};

type DatasetRow = Record<string, string>;

type MatchResult = {
  productId: string;
  productName: string;
  remoteName: string;
  imageUrl: string;
  sourcePath: string;
  section: string | null;
  description: string | null;
  countryCode: string | null;
  cityCode: string | null;
  storeName: string | null;
  score: number;
};

const DATASET_URL = "https://glovo-products-dataset-d1c9720d.s3.amazonaws.com/glovo-foodi-ml-dataset.csv";
const IMAGE_BASE_URL = "https://glovo-products-dataset-d1c9720d.s3.amazonaws.com";
const PREFERRED_COUNTRIES = new Set(["PT", "ES", "BR"]);
const MANUAL_FALLBACK_IMAGES: Record<string, string> = {
  "Almadén Tinto Suave 750ml": "https://images.unsplash.com/photo-1586370434639-0fe43b2d32e6?w=400&h=400&fit=crop",
  "Brahma Duplo Malte 350ml": "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&h=400&fit=crop",
  "Chandon Brut 750ml": "https://images.unsplash.com/photo-1592845820419-f484ae079041?w=400&h=400&fit=crop",
  "Colorado Appia 600ml": "https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=400&h=400&fit=crop",
  "Gelo Pacote 3kg": "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=400&h=400&fit=crop",
  "Kit Churrasco - 12 Cervejas": "https://images.unsplash.com/photo-1575367439058-6096bb9cf5e2?w=400&h=400&fit=crop",
  "Kit Festa 24 Cervejas": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
  "Kit Vinho & Queijo": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
  "Mike's Hard Lemonade 275ml": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=400&fit=crop",
  "Petra Origem 600ml": "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&h=400&fit=crop",
  "Sangue de Boi 1L": "https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400&h=400&fit=crop",
  "Whisky Chivas 12 anos 1L": "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=400&h=400&fit=crop",
};
const STOP_WORDS = new Set([
  "bebida",
  "bebidas",
  "cerveja",
  "cervejas",
  "refrigerante",
  "refrigerantes",
  "vinho",
  "vinhos",
  "destilado",
  "destilados",
  "drink",
  "drinks",
  "com",
  "sem",
  "de",
  "do",
  "da",
  "em",
  "para",
  "the",
  "and",
]);

const TYPE_KEYWORDS: Record<string, string[]> = {
  cervejas: ["beer", "beers", "cerveja", "cervejas", "cerveza", "cervezas", "lager", "ipa", "stout", "pilsen", "pilsen", "ale", "hefe", "weiss"],
  vinhos: ["wine", "wines", "vino", "vinos", "vinho", "vinhos", "rose", "rosee", "rose", "rosado", "merlot", "cabernet", "sauvignon", "prosecco", "champagne", "espumante", "espumantes"],
  destilados: ["whisky", "whiskey", "vodka", "gin", "ginebra", "rum", "ron", "tequila", "mezcal", "cachaca", "cachaca", "aguardiente", "aguardientes", "brandy", "cognac", "liqueur", "liqueurs", "licor", "licores", "spirits", "spirit", "spirt", "spirtoase"],
  drinks: ["cocktail", "cocktails", "drink", "drinks", "spritz", "mojito", "margarita", "caipirinha", "tonic", "tonica", "tonica", "cooler", "hard lemonade", "kit cocktail", "cocktail kit"],
  refrigerantes: ["soda", "soft drink", "soft drinks", "refrigerante", "refrigerantes", "cola", "tonic", "tonica", "tonica", "agua", "water", "sparkling", "juice", "juices", "suco", "sucos", "nectar", "sprite", "fanta", "coca cola", "schweppes", "del valle"],
};

const GENERIC_BEVERAGE_KEYWORDS = Array.from(new Set([
  ...Object.values(TYPE_KEYWORDS).flat(),
  "bebida",
  "bebidas",
  "beverage",
  "beverages",
  "alcoolica",
  "alcoolicas",
  "alcoholic",
  "alcoholicas",
]));

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stripVolume(value: string): string {
  return value.replace(/\b\d+(?:[.,]\d+)?\s?(ml|cl|l|lt|litro|litros|oz|g|kg)\b/gi, " ").replace(/\s+/g, " ").trim();
}

function extractVolumeMl(value: string | null | undefined): number | null {
  const normalized = normalizeText(value).replace(/,/g, ".");
  const match = normalized.match(/(\d+(?:\.\d+)?)\s?(ml|cl|l|lt|litro|litros)\b/);
  if (!match) return null;

  const amount = Number(match[1]);
  if (Number.isNaN(amount)) return null;

  const unit = match[2];
  if (unit === "ml") return amount;
  if (unit === "cl") return amount * 10;
  return amount * 1000;
}

function extractPackageType(value: string | null | undefined): "lata" | "garrafa" | "long-neck" | null {
  const normalized = normalizeText(value);
  if (normalized.includes("long neck") || normalized.includes("longneck")) return "long-neck";
  if (normalized.includes("lata") || normalized.includes("can")) return "lata";
  if (normalized.includes("garrafa") || normalized.includes("bottle") || normalized.includes("pet")) return "garrafa";
  return null;
}

function buildTokenSet(value: string | null | undefined): Set<string> {
  return new Set(
    normalizeText(stripVolume(value ?? ""))
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function getTypeKeywords(type: string): string[] {
  const normalized = normalizeText(type);
  if (normalized.includes("cervej")) return TYPE_KEYWORDS.cervejas;
  if (normalized.includes("vinh")) return TYPE_KEYWORDS.vinhos;
  if (normalized.includes("destil")) return TYPE_KEYWORDS.destilados;
  if (normalized.includes("drink")) return TYPE_KEYWORDS.drinks;
  if (normalized.includes("refriger")) return TYPE_KEYWORDS.refrigerantes;
  return [];
}

function hasKeywordMatch(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function isLikelyBeverageRow(product: ProductRow, row: DatasetRow): boolean {
  const combined = normalizeText([
    row.collection_section,
    row.product_name,
    row.product_description,
    row.store_name,
  ].join(" "));

  return hasKeywordMatch(combined, GENERIC_BEVERAGE_KEYWORDS)
    || hasKeywordMatch(combined, getTypeKeywords(product.type));
}

function countTokenOverlap(left: Set<string>, right: Set<string>): number {
  let overlap = 0;
  for (const token of left) {
    if (right.has(token)) overlap += 1;
  }
  return overlap;
}

function hasStrongNameEvidence(productName: string, remoteName: string): boolean {
  const normalizedProduct = normalizeText(stripVolume(productName));
  const normalizedRemote = normalizeText(stripVolume(remoteName));
  if (!normalizedProduct || !normalizedRemote) return false;
  if (normalizedProduct === normalizedRemote) return true;

  const productTokens = buildTokenSet(productName);
  const remoteTokens = buildTokenSet(remoteName);
  const overlap = countTokenOverlap(productTokens, remoteTokens);

  if (overlap >= 2) return true;
  if (productTokens.size <= 1 && overlap >= 1) return true;

  return false;
}

function isSuspiciousAssignment(product: ProductRow): boolean {
  const remoteName = product.source_product_name ?? "";
  const remoteDescription = product.source_description ?? "";
  const remoteSection = normalizeText(product.source_section);
  const sourceText = `${remoteName} ${remoteDescription}`.trim();
  const localVolume = extractVolumeMl(product.name);
  const remoteVolume = extractVolumeMl(sourceText);
  const localPackage = extractPackageType(product.name);
  const remotePackage = extractPackageType(sourceText);

  if (!product.source_image_path) return false;
  if (!hasStrongNameEvidence(product.name, remoteName)) return true;
  if (!hasKeywordMatch(remoteSection, GENERIC_BEVERAGE_KEYWORDS) && !hasKeywordMatch(remoteSection, getTypeKeywords(product.type))) {
    return true;
  }
  if (localPackage && remotePackage && localPackage !== remotePackage) return true;
  if (localVolume && remoteVolume) {
    const delta = Math.abs(localVolume - remoteVolume);
    const ratio = Math.max(localVolume, remoteVolume) / Math.min(localVolume, remoteVolume);
    if (delta >= 700 && ratio >= 1.8) return true;
  }

  return false;
}

function buildSearchPhrases(productName: string): string[] {
  const normalized = normalizeText(stripVolume(productName));
  const phrases = new Set<string>([normalized]);

  const replacements: Array<[RegExp, string]> = [
    [/\bcoca cola\b/g, "coca-cola"],
    [/\bjack daniels\b/g, "jack daniels"],
    [/\bjohnnie walker\b/g, "johnnie walker"],
    [/\bagua tonica schweppes\b/g, "schweppes"],
    [/\bwhisky\b/g, ""],
    [/\bvodka\b/g, ""],
    [/\bvinho\b/g, ""],
    [/\bcerveja\b/g, ""],
    [/\brefrigerante\b/g, ""],
    [/\bbebida\b/g, ""],
  ];

  let mutated = normalized;
  for (const [pattern, replacement] of replacements) {
    mutated = mutated.replace(pattern, replacement).replace(/\s+/g, " ").trim();
  }
  if (mutated) phrases.add(mutated);

  const tokens = mutated.split(" ").filter((token) => token.length > 2);
  if (tokens.length >= 2) {
    phrases.add(tokens.slice(0, 2).join(" "));
  }
  if (tokens.length >= 1) {
    phrases.add(tokens[0]);
  }

  return [...phrases].filter(Boolean);
}

async function* parseCsvResponse(response: Response): AsyncGenerator<string[]> {
  if (!response.body) throw new Error("Resposta do dataset sem corpo.");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = "";
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    let index = 0;

    while (index < buffer.length) {
      const char = buffer[index];

      if (inQuotes) {
        if (char === '"') {
          if (index + 1 < buffer.length && buffer[index + 1] === '"') {
            field += '"';
            index += 2;
            continue;
          }
          if (index + 1 >= buffer.length) break;
          inQuotes = false;
          index += 1;
          continue;
        }
        field += char;
        index += 1;
        continue;
      }

      if (char === '"') {
        inQuotes = true;
        index += 1;
        continue;
      }

      if (char === ",") {
        row.push(field);
        field = "";
        index += 1;
        continue;
      }

      if (char === "\n") {
        row.push(field);
        field = "";
        yield row;
        row = [];
        index += 1;
        continue;
      }

      if (char === "\r") {
        if (index + 1 >= buffer.length) break;
        row.push(field);
        field = "";
        yield row;
        row = [];
        index += buffer[index + 1] === "\n" ? 2 : 1;
        continue;
      }

      field += char;
      index += 1;
    }

    buffer = buffer.slice(index);
  }

  buffer += decoder.decode();
  if (buffer) field += buffer;
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    yield row;
  }
}

function buildObject(headers: string[], values: string[]): DatasetRow {
  return headers.reduce<DatasetRow>((accumulator, header, index) => {
    accumulator[header] = values[index] ?? "";
    return accumulator;
  }, {});
}

function scoreMatch(product: ProductRow, phrases: string[], row: DatasetRow): number {
  const remoteName = normalizeText(row.product_name);
  const section = normalizeText(row.collection_section);
  const type = normalizeText(product.type);
  const localTokens = buildTokenSet(product.name);
  const remoteTokens = buildTokenSet(row.product_name);
  const tokenOverlap = countTokenOverlap(localTokens, remoteTokens);

  if (!row.product_name || !row.s3_path) return Number.NEGATIVE_INFINITY;
  if (!isLikelyBeverageRow(product, row)) return Number.NEGATIVE_INFINITY;
  if (!hasStrongNameEvidence(product.name, row.product_name)) return Number.NEGATIVE_INFINITY;

  let score = 0;
  for (const phrase of phrases) {
    if (!phrase) continue;
    if (remoteName === phrase) score += 120;
    else if (phrase.includes(" ") && remoteName.includes(phrase)) score += 70;
  }

  score += tokenOverlap * 22;

  if (PREFERRED_COUNTRIES.has((row.country_code || "").toUpperCase())) score += 12;
  if (hasKeywordMatch(section, GENERIC_BEVERAGE_KEYWORDS)) score += 14;
  if (hasKeywordMatch(section, getTypeKeywords(product.type))) score += 12;
  if (type.includes("refriger") && hasKeywordMatch(section, TYPE_KEYWORDS.refrigerantes)) score += 8;
  if (type.includes("cervej") && hasKeywordMatch(section, TYPE_KEYWORDS.cervejas)) score += 8;
  if (type.includes("vinho") && hasKeywordMatch(section, TYPE_KEYWORDS.vinhos)) score += 8;
  if (type.includes("destil") && hasKeywordMatch(section, TYPE_KEYWORDS.destilados)) score += 8;

  const localVolume = extractVolumeMl(product.name);
  const remoteVolume = extractVolumeMl(`${row.product_name || ""} ${row.product_description || ""}`);
  if (localVolume && remoteVolume) {
    const delta = Math.abs(localVolume - remoteVolume);
    const ratio = Math.max(localVolume, remoteVolume) / Math.min(localVolume, remoteVolume);

    if (delta <= Math.max(120, localVolume * 0.12)) score += 32;
    else if (delta <= Math.max(250, localVolume * 0.3)) score += 6;
    else if (delta >= 700 && ratio >= 1.8) return Number.NEGATIVE_INFINITY;
    else score -= 40;
  }

  const localPackage = extractPackageType(product.name);
  const remotePackage = extractPackageType(`${row.product_name || ""} ${row.product_description || ""}`);
  if (localPackage && remotePackage) {
    if (localPackage === remotePackage) score += 18;
    else return Number.NEGATIVE_INFINITY;
  }

  return score;
}

async function main(): Promise<void> {
  const env = loadSupabaseEnv();
  const key = env.serviceRoleKey ?? env.publishableKey;
  if (!key) throw new Error("Missing Supabase key");

  const supabase = createClient(env.url, key);
  const productsResult = await supabase
    .from("products")
    .select("id,name,type,image_url,source_product_name,source_description,source_section,source_image_path")
    .order("name");

  if (productsResult.error) throw productsResult.error;
  const products = (productsResult.data ?? []) as ProductRow[];
  const remaining = new Map(products.map((product) => [product.id, product]));
  const searchMap = new Map(products.map((product) => [product.id, buildSearchPhrases(product.name)]));
  const bestMatches = new Map<string, MatchResult>();

  const response = await fetch(DATASET_URL);
  if (!response.ok) throw new Error(`Failed to download dataset: ${response.status}`);

  let headers: string[] | null = null;
  let scanned = 0;

  for await (const values of parseCsvResponse(response)) {
    if (!headers) {
      headers = values;
      continue;
    }

    scanned += 1;
    const row = buildObject(headers, values);
    const remoteName = row.product_name || "";
    if (!remoteName || !row.s3_path) continue;

    for (const [productId, product] of remaining) {
      const phrases = searchMap.get(productId) ?? [];
      const score = scoreMatch(product, phrases, row);
      if (score < 110) continue;

      const current = bestMatches.get(productId);
      if (!current || score > current.score) {
        bestMatches.set(productId, {
          productId,
          productName: product.name,
          remoteName: row.product_name,
          imageUrl: `${IMAGE_BASE_URL}/${row.s3_path}`,
          sourcePath: row.s3_path,
          section: row.collection_section || null,
          description: row.product_description || null,
          countryCode: row.country_code || null,
          cityCode: row.city_code || null,
          storeName: row.store_name || null,
          score,
        });
      }
    }

    if (scanned % 100000 === 0) {
      console.log(`Scanned ${scanned} rows, matched ${bestMatches.size}/${products.length}`);
    }
  }

  let updated = 0;
  for (const match of bestMatches.values()) {
    const payload = {
      image_url: match.imageUrl,
      source_dataset: "Glovo/FooDI-ML",
      source_product_name: match.remoteName,
      source_section: match.section,
      source_description: match.description,
      source_country_code: match.countryCode,
      source_city_code: match.cityCode,
      source_store_name: match.storeName,
      source_image_path: match.sourcePath,
    };

    const { error } = await supabase.from("products").update(payload).eq("id", match.productId);
    if (error) throw error;
    updated += 1;
  }

  let cleared = 0;
  for (const product of products) {
    if (bestMatches.has(product.id)) continue;
    if (!isSuspiciousAssignment(product)) continue;

    const { error } = await supabase
      .from("products")
      .update({
        image_url: MANUAL_FALLBACK_IMAGES[product.name] ?? null,
        source_dataset: null,
        source_product_name: null,
        source_section: null,
        source_description: null,
        source_country_code: null,
        source_city_code: null,
        source_store_name: null,
        source_image_path: null,
      })
      .eq("id", product.id);

    if (error) throw error;
    cleared += 1;
  }

  console.log(JSON.stringify({
    products: products.length,
    matched: bestMatches.size,
    updated,
    cleared,
    sample: [...bestMatches.values()].slice(0, 10),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});