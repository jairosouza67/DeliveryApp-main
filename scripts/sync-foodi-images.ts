import { createClient } from "@supabase/supabase-js";
import { loadSupabaseEnv } from "./loadSupabaseEnv";

type ProductRow = {
  id: string;
  name: string;
  type: string;
  image_url: string | null;
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

  let score = 0;
  for (const phrase of phrases) {
    if (!phrase) continue;
    if (remoteName === phrase) score += 120;
    else if (remoteName.includes(phrase)) score += 70;
  }

  if (PREFERRED_COUNTRIES.has((row.country_code || "").toUpperCase())) score += 12;
  if (section.includes("bebid") || section.includes("soda") || section.includes("beer") || section.includes("vin") || section.includes("drink")) score += 10;
  if (type.includes("refriger") && (section.includes("soda") || section.includes("bebid"))) score += 8;
  if (type.includes("cervej") && section.includes("beer")) score += 8;
  if (type.includes("vinho") && (section.includes("wine") || section.includes("vin"))) score += 8;
  if (type.includes("destil") && (section.includes("drink") || section.includes("spirits") || section.includes("bebid"))) score += 4;

  return score;
}

async function main(): Promise<void> {
  const env = loadSupabaseEnv();
  const key = env.serviceRoleKey ?? env.publishableKey;
  if (!key) throw new Error("Missing Supabase key");

  const supabase = createClient(env.url, key);
  const productsResult = await supabase
    .from("products")
    .select("id,name,type,image_url")
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
      if (score < 80) continue;

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

  console.log(JSON.stringify({
    products: products.length,
    matched: bestMatches.size,
    updated,
    sample: [...bestMatches.values()].slice(0, 10),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});