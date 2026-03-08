import { supabase } from "@/integrations/supabase/client";
import type { DashboardStats, LowStockProduct, OrderStatusSummary, QuoteRecord } from "./types";

const STATUS_LABELS: Record<string, string> = {
  pending: "Recebido",
  approved: "Aprovado",
  cancelled: "Cancelado",
  processing: "Separando",
  delivered: "Entregue",
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [customersCount, productsCount, ordersCount, approvedOrders] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("*", { count: "exact", head: true }),
    supabase.from("quotes").select("total_value").eq("status", "approved"),
  ]);

  const todaySales = (approvedOrders.data ?? []).reduce(
    (sum, order) => sum + (order.total_value || 0),
    0,
  );

  return {
    customers: customersCount.count || 0,
    products: productsCount.count || 0,
    orders: ordersCount.count || 0,
    todaySales,
  };
}

export async function fetchOrdersByStatus(): Promise<OrderStatusSummary[]> {
  const { data, error } = await supabase.from("quotes").select("status");
  if (error) throw error;

  const orders = data ?? [];
  const total = orders.length;
  if (total === 0) return [];

  const counts = orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).map(([status, count]) => ({
    status: STATUS_LABELS[status] || status,
    count,
    percentage: (count / total) * 100,
  }));
}

export async function fetchLowStockProducts(): Promise<LowStockProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("name, in_stock")
    .eq("in_stock", false)
    .order("name", { ascending: true })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

export async function fetchRecentOrders(): Promise<QuoteRecord[]> {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;
  return (data ?? []) as QuoteRecord[];
}

export function subscribeToDashboardUpdates(onQuotesChange: () => void, onProductsChange: () => void) {
  const quotesChannel = supabase
    .channel("quotes-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, onQuotesChange)
    .subscribe();

  const productsChannel = supabase
    .channel("products-changes")
    .on("postgres_changes", { event: "*", schema: "public", table: "products" }, onProductsChange)
    .subscribe();

  return () => {
    supabase.removeChannel(quotesChannel);
    supabase.removeChannel(productsChannel);
  };
}
