import { supabase } from "@/integrations/supabase/client";
import type { QuoteRecord, QuoteStatus } from "./types";

export async function listQuotes(): Promise<QuoteRecord[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as QuoteRecord[];
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<{ reminderCreated: boolean }> {
  const { data, error } = await supabase
    .from("quotes")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return { reminderCreated: false };
}

export async function deleteQuote(id: string): Promise<void> {
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw error;
}
