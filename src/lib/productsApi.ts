import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { readCache, removeCache, writeCache } from "@/lib/cache";

const CACHE_VERSION = 2;

const ALL_PRODUCTS_KEY = "products:all";
const FEATURED_PRODUCTS_KEY = "products:featured";

const ALL_PRODUCTS_TTL_MS = 10 * 60 * 1000; // 10 min
const FEATURED_TTL_MS = 5 * 60 * 1000; // 5 min

const inFlight = new Map<string, Promise<unknown>>();

export type ProductRecord = Database["public"]["Tables"]["products"]["Row"];

function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const p = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, p);
  return p;
}

export function getAllProductsCached(): ProductRecord[] | null {
  const cached = readCache<ProductRecord[]>({
    key: ALL_PRODUCTS_KEY,
    ttlMs: ALL_PRODUCTS_TTL_MS,
    version: CACHE_VERSION,
  });
  return cached?.data ?? null;
}

export async function refreshAllProducts(): Promise<ProductRecord[]> {
  return dedupe(ALL_PRODUCTS_KEY, async () => {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (error) throw error;
    const products = (data ?? []) as ProductRecord[];
    writeCache(
      { key: ALL_PRODUCTS_KEY, ttlMs: ALL_PRODUCTS_TTL_MS, version: CACHE_VERSION },
      products,
    );
    return products;
  });
}

export function getFeaturedProductsCached(): ProductRecord[] | null {
  const cached = readCache<ProductRecord[]>({
    key: FEATURED_PRODUCTS_KEY,
    ttlMs: FEATURED_TTL_MS,
    version: CACHE_VERSION,
  });
  return cached?.data ?? null;
}

export async function refreshFeaturedProducts(): Promise<ProductRecord[]> {
  return dedupe(FEATURED_PRODUCTS_KEY, async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .limit(4)
      .order("created_at", { ascending: false });

    if (error) throw error;
    const products = (data ?? []) as ProductRecord[];
    writeCache(
      { key: FEATURED_PRODUCTS_KEY, ttlMs: FEATURED_TTL_MS, version: CACHE_VERSION },
      products,
    );
    return products;
  });
}

export function invalidateProductsCache(): void {
  removeCache(ALL_PRODUCTS_KEY);
  removeCache(FEATURED_PRODUCTS_KEY);
  inFlight.delete(ALL_PRODUCTS_KEY);
  inFlight.delete(FEATURED_PRODUCTS_KEY);
}

export function selectRelatedFromAll(
  all: ProductRecord[],
  options: { type: string; excludeId: string; limit?: number; categorySlug?: string | null },
): ProductRecord[] {
  const limit = options.limit ?? 4;
  return all
    .filter(
      (p) =>
        (options.categorySlug
          ? p.category_slug === options.categorySlug
          : p.type === options.type) &&
        p.id !== options.excludeId &&
        p.in_stock === true,
    )
    .slice(0, limit);
}
