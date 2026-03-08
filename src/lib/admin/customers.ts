import { supabase } from "@/integrations/supabase/client";
import type { CustomerInsert, CustomerRecord, CustomerUpdate } from "./types";

export async function listCustomers(): Promise<CustomerRecord[]> {
  const { data, error } = await supabase.from("customers").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createCustomer(payload: CustomerInsert): Promise<void> {
  const { error } = await supabase.from("customers").insert([payload]);
  if (error) throw error;
}

export async function updateCustomer(id: string, payload: CustomerUpdate): Promise<void> {
  const { error } = await supabase.from("customers").update(payload).eq("id", id);
  if (error) throw error;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw error;
}
