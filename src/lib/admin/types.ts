import type { Database, Json } from "@/integrations/supabase/types";
import type { Enums } from "@/integrations/supabase/types";

export type CustomerRecord = Database["public"]["Tables"]["customers"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customers"]["Insert"];
export type CustomerUpdate = Database["public"]["Tables"]["customers"]["Update"];

export type SupplierRecord = Database["public"]["Tables"]["suppliers"]["Row"];
export type SupplierInsert = Database["public"]["Tables"]["suppliers"]["Insert"];
export type SupplierUpdate = Database["public"]["Tables"]["suppliers"]["Update"];

export type ProductRecord = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export type QuoteRecord = Database["public"]["Tables"]["quotes"]["Row"] & {
  items: Json;
};
export type QuoteStatus = QuoteRecord["status"];

export type UserRole = Enums<"app_role">;

export interface AdminUser {
  id: string;
  email: string | undefined;
  role: UserRole | null;
}

export interface DashboardStats {
  customers: number;
  products: number;
  orders: number;
  todaySales: number;
}

export interface OrderStatusSummary {
  status: string;
  count: number;
  percentage: number;
}

export type LowStockProduct = Pick<ProductRecord, "name" | "in_stock">;
