import { supabase } from "@/integrations/supabase/client";
import type { SupplierInsert, SupplierRecord, SupplierUpdate } from "./types";

export async function listSuppliers(): Promise<SupplierRecord[]> {
  const { data, error } = await supabase.from("suppliers").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createSupplier(payload: SupplierInsert): Promise<void> {
  const { error } = await supabase.from("suppliers").insert([payload]);
  if (error) throw error;
}

export async function updateSupplier(id: string, payload: SupplierUpdate): Promise<void> {
  const { error } = await supabase.from("suppliers").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}
