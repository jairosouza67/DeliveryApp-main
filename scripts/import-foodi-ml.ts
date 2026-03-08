import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { loadSupabaseEnv } from "./loadSupabaseEnv";

type ProductInsertRow = {
  name: string;
  type: string;
  category_slug: string;
  price: number;
  currency_code: string;
  price_source: string;
  price_reference_label: string;
  in_stock: boolean;
  description: string | null;
  image_url: string | null;
  brand: string | null;
  volume_label: string | null;
  package_type: string | null;
  alcoholic: boolean | null;
  abv: string | null;
  source_dataset: string;
  source_product_name: string;
  source_section: string | null;
  source_description: string | null;
  source_country_code: string | null;
  source_city_code: string | null;
  source_store_name: string | null;
  source_image_path: string | null;
  status: string;
};

type CliOptions = {
  datasetPath: string;
  outputPath: string;
  limit?: number;
  countries: Set<string> | null;
  imageBaseUrl?: string;
  writeSupabase: boolean;
  supabaseUrl?: string;
  supabaseKey?: string;
  status: string;
};

type PriceEntry = {
  price: number;
  currencyCode: string;
  referenceLabel: string;
};

type PriceMapping = {
  priceSource: string;
  referenceLabel: string;
  exactPrices: Record<string, PriceEntry>;
  aliases: Record<string, string>;
  fallbackByCategory: Record<string, PriceEntry>;
};

type DatasetRow = Record<string, string>;

type MatchType = "exact" | "alias" | "fallback";

const categoryLabels: Record<string, string> = {
  cervejas: "Cervejas",
  vinhos: "Vinhos",
  destilados: "Destilados",
  drinks: "Drinks",
  refrigerantes: "Refrigerantes",
};

const categoryKeywords: Array<{ slug: keyof typeof categoryLabels; keywords: string[] }> = [
  { slug: "cervejas", keywords: ["beer", "beers", "cerveja", "cervejas", "lager", "ipa", "stout", "pilsen", "ale", "super bock"] },
  { slug: "vinhos", keywords: ["wine", "wines", "vinho", "vinhos", "porto", "port", "madeira", "moscatel", "riesling", "champagne", "prosecco"] },
  { slug: "destilados", keywords: ["whisky", "whiskey", "vodka", "gin", "rum", "tequila", "mezcal", "cachaca", "brandy", "cognac", "armagnac", "liqueur", "vermouth", "pastis", "campari"] },
  { slug: "drinks", keywords: ["cocktail", "cocktails", "drink", "drinks", "martini", "spritz", "mojito", "margarita", "caipirinha", "tonic", "bloody mary"] },
  { slug: "refrigerantes", keywords: ["soda", "soft drink", "refrigerante", "juice", "juices", "suco", "water", "sparkling water", "tonic water", "cola", "sevenup", "kombucha"] },
];

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function parseArgs(argv: string[]): CliOptions {
  const options: Partial<CliOptions> = {
    outputPath: path.resolve(process.cwd(), "scripts", "foodi-ml-curated-products.json"),
    writeSupabase: false,
    status: "draft",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--dataset-path" && next) {
      options.datasetPath = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }
    if (arg === "--output" && next) {
      options.outputPath = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }
    if (arg === "--limit" && next) {
      options.limit = Number(next);
      index += 1;
      continue;
    }
    if (arg === "--countries" && next) {
      options.countries = new Set(next.split(",").map((value) => value.trim().toUpperCase()).filter(Boolean));
      index += 1;
      continue;
    }
    if (arg === "--image-base-url" && next) {
      options.imageBaseUrl = next.replace(/\/$/, "");
      index += 1;
      continue;
    }
    if (arg === "--write-supabase") {
      options.writeSupabase = true;
      continue;
    }
    if (arg === "--supabase-url" && next) {
      options.supabaseUrl = next;
      index += 1;
      continue;
    }
    if (arg === "--supabase-key" && next) {
      options.supabaseKey = next;
      index += 1;
      continue;
    }
    if (arg === "--status" && next) {
      options.status = next;
      index += 1;
    }
  }

  if (!options.datasetPath) {
    throw new Error("Use --dataset-path <arquivo.csv> para informar o CSV do FooDI-ML.");
  }

  return options as CliOptions;
}

async function* parseCsvRows(filePath: string): AsyncGenerator<string[]> {
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  let buffer = "";
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for await (const chunk of stream) {
    buffer += chunk;
    let index = 0;

    while (index < buffer.length) {
      const char = buffer[index];

      if (inQuotes) {
        if (char === '"') {
          if (index + 1 >= buffer.length) {
            break;
          }
          if (buffer[index + 1] === '"') {
            field += '"';
            index += 2;
            continue;
          }
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
        if (index + 1 >= buffer.length) {
          break;
        }
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

  if (buffer.length > 0) {
    if (buffer === '"' && inQuotes) {
      throw new Error("CSV terminou com aspas abertas.");
    }
    if (!inQuotes) {
      field += buffer;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    yield row;
  }
}

function buildRowObject(headers: string[], row: string[]): DatasetRow {
  return headers.reduce<DatasetRow>((accumulator, header, index) => {
    accumulator[header] = row[index] ?? "";
    return accumulator;
  }, {});
}

function isBeverageCandidate(row: DatasetRow): boolean {
  const combined = normalizeText([
    row.collection_section,
    row.product_name,
    row.product_description,
  ].join(" "));

  return categoryKeywords.some(({ keywords }) => keywords.some((keyword) => combined.includes(keyword)));
}

function classifyCategory(row: DatasetRow): keyof typeof categoryLabels | null {
  const combined = normalizeText([
    row.collection_section,
    row.product_name,
    row.product_description,
  ].join(" "));

  for (const entry of categoryKeywords) {
    if (entry.keywords.some((keyword) => combined.includes(keyword))) {
      return entry.slug;
    }
  }

  return null;
}

function extractVolumeLabel(name: string, description: string): string | null {
  const match = `${name} ${description}`.match(/(\d+(?:[.,]\d+)?)\s?(ml|cl|l|lt|litro|litros)\b/i);
  if (!match) return null;
  return `${match[1].replace(".", ",")}${match[2].toLowerCase()}`;
}

function extractPackageType(name: string, description: string): string | null {
  const combined = normalizeText(`${name} ${description}`);
  if (combined.includes("long neck")) return "Long Neck";
  if (combined.includes("lata") || combined.includes("can")) return "Lata";
  if (combined.includes("garrafa") || combined.includes("bottle")) return "Garrafa";
  if (combined.includes("mini")) return "Mini";
  if (combined.includes("draft") || combined.includes("dose")) return "Dose";
  return null;
}

function extractAbv(name: string, description: string): string | null {
  const match = `${name} ${description}`.match(/(\d+(?:[.,]\d+)?)\s?%/);
  return match ? `${match[1]}%` : null;
}

function inferAlcoholic(categorySlug: keyof typeof categoryLabels, name: string, description: string): boolean | null {
  const combined = normalizeText(`${name} ${description}`);
  if (combined.includes("alcohol free") || combined.includes("alcohol-free") || combined.includes("sem alcool") || combined.includes("non alcoholic")) {
    return false;
  }
  if (categorySlug === "refrigerantes") return false;
  if (["cervejas", "vinhos", "destilados", "drinks"].includes(categorySlug)) return true;
  return null;
}

function extractBrand(name: string, volumeLabel: string | null): string | null {
  const cleaned = name.replace(new RegExp(volumeLabel ?? "^$", "i"), "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  const joined = `${parts[0]} ${parts[1]}`;
  if (["johnnie walker", "grey goose", "super bock", "coca cola", "fever tree", "jack daniels"].includes(normalizeText(joined))) {
    return joined;
  }
  return parts[0];
}

function resolveImageUrl(sourceImagePath: string, imageBaseUrl?: string): string | null {
  if (!sourceImagePath) return null;
  if (/^https?:\/\//i.test(sourceImagePath)) return sourceImagePath;
  if (!imageBaseUrl) return null;
  return `${imageBaseUrl}/${path.basename(sourceImagePath).replace(/\\/g, "/")}`;
}

function loadPriceMapping(): PriceMapping {
  const mappingPath = path.resolve(process.cwd(), "scripts", "price-mapping.areias.json");
  return readJsonFile<PriceMapping>(mappingPath);
}

function matchPrice(
  mapping: PriceMapping,
  categorySlug: keyof typeof categoryLabels,
  productName: string,
): { entry: PriceEntry; matchType: MatchType } | null {
  const normalizedName = normalizeText(productName);

  for (const [rawName, entry] of Object.entries(mapping.exactPrices)) {
    if (normalizeText(rawName) === normalizedName) {
      return { entry, matchType: "exact" };
    }
  }

  const aliasedTarget = Object.entries(mapping.aliases).find(([alias]) => normalizeText(alias) === normalizedName)?.[1];
  if (aliasedTarget) {
    const entry = mapping.exactPrices[aliasedTarget];
    if (entry) return { entry, matchType: "alias" };
  }

  for (const [alias, canonical] of Object.entries(mapping.aliases)) {
    if (normalizedName.includes(normalizeText(alias))) {
      const entry = mapping.exactPrices[canonical];
      if (entry) return { entry, matchType: "alias" };
    }
  }

  const fallback = mapping.fallbackByCategory[categorySlug];
  if (fallback) {
    return { entry: fallback, matchType: "fallback" };
  }

  return null;
}

async function writeSupabaseRows(rows: ProductInsertRow[], options: CliOptions): Promise<void> {
  const envConfig = loadSupabaseEnv();
  const supabaseUrl = options.supabaseUrl ?? envConfig.url;
  const supabaseKey = options.supabaseKey ?? envConfig.serviceRoleKey ?? envConfig.publishableKey;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Para usar --write-supabase, configure SUPABASE_SERVICE_ROLE_KEY ou a chave pública do projeto no ambiente/.env.");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const batchSize = 100;

  for (let index = 0; index < rows.length; index += batchSize) {
    const batch = rows.slice(index, index + batchSize);
    const { error } = await supabase.from("products").insert(batch);
    if (error) throw error;
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const mapping = loadPriceMapping();
  const outputDirectory = path.dirname(options.outputPath);
  fs.mkdirSync(outputDirectory, { recursive: true });

  let headers: string[] | null = null;
  const seen = new Set<string>();
  const rows: ProductInsertRow[] = [];
  const summary = {
    scanned: 0,
    accepted: 0,
    skippedNotBeverage: 0,
    skippedCountry: 0,
    skippedNoPrice: 0,
    skippedDuplicate: 0,
    exact: 0,
    alias: 0,
    fallback: 0,
  };

  for await (const rowValues of parseCsvRows(options.datasetPath)) {
    if (!headers) {
      headers = rowValues.map((value) => value.trim());
      continue;
    }

    summary.scanned += 1;
    const row = buildRowObject(headers, rowValues);

    if (options.countries && row.country_code && !options.countries.has(row.country_code.toUpperCase())) {
      summary.skippedCountry += 1;
      continue;
    }

    if (!isBeverageCandidate(row)) {
      summary.skippedNotBeverage += 1;
      continue;
    }

    const categorySlug = classifyCategory(row);
    if (!categorySlug) {
      summary.skippedNotBeverage += 1;
      continue;
    }

    const name = (row.product_name || "").trim();
    if (!name) {
      summary.skippedNotBeverage += 1;
      continue;
    }

    const priceMatch = matchPrice(mapping, categorySlug, name);
    if (!priceMatch) {
      summary.skippedNoPrice += 1;
      continue;
    }

    const dedupeKey = [normalizeText(name), categorySlug, normalizeText(row.s3_path || row.product_description || "")].join("|");
    if (seen.has(dedupeKey)) {
      summary.skippedDuplicate += 1;
      continue;
    }
    seen.add(dedupeKey);

    const description = (row.product_description || "").trim() || null;
    const volumeLabel = extractVolumeLabel(name, description ?? "");
    const productRow: ProductInsertRow = {
      name,
      type: categoryLabels[categorySlug],
      category_slug: categorySlug,
      price: priceMatch.entry.price,
      currency_code: priceMatch.entry.currencyCode,
      price_source: mapping.priceSource,
      price_reference_label: `${mapping.referenceLabel} • ${priceMatch.entry.referenceLabel}`,
      in_stock: true,
      description,
      image_url: resolveImageUrl(row.s3_path, options.imageBaseUrl),
      brand: extractBrand(name, volumeLabel),
      volume_label: volumeLabel,
      package_type: extractPackageType(name, description ?? ""),
      alcoholic: inferAlcoholic(categorySlug, name, description ?? ""),
      abv: extractAbv(name, description ?? ""),
      source_dataset: "Glovo/FooDI-ML",
      source_product_name: name,
      source_section: row.collection_section || null,
      source_description: description,
      source_country_code: row.country_code || null,
      source_city_code: row.city_code || null,
      source_store_name: row.store_name || null,
      source_image_path: row.s3_path || null,
      status: options.status,
    };

    rows.push(productRow);
    summary.accepted += 1;
    summary[priceMatch.matchType] += 1;

    if (options.limit && rows.length >= options.limit) {
      break;
    }
  }

  fs.writeFileSync(options.outputPath, JSON.stringify(rows, null, 2));

  if (options.writeSupabase) {
    await writeSupabaseRows(rows, options);
  }

  console.log(JSON.stringify({ output: options.outputPath, count: rows.length, summary }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});