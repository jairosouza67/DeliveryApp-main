import {
  getAllProductsCached,
  invalidateProductsCache,
  refreshAllProducts,
  type ProductRecord as CachedProductRecord,
} from "@/lib/productsApi";
import { supabase } from "@/integrations/supabase/client";
import type { ProductInsert, ProductRecord, ProductUpdate } from "./types";

export function getCachedProducts(): ProductRecord[] | null {
  return getAllProductsCached() as ProductRecord[] | null;
}

export async function listProducts(): Promise<ProductRecord[]> {
  return (await refreshAllProducts()) as ProductRecord[];
}

export async function createProduct(payload: ProductInsert): Promise<void> {
  const { error } = await supabase.from("products").insert([payload]);
  if (error) throw error;
  invalidateProductsCache();
}

export async function updateProduct(id: string, payload: ProductUpdate): Promise<void> {
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) throw error;
  invalidateProductsCache();
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  invalidateProductsCache();
}

export type { CachedProductRecord };
