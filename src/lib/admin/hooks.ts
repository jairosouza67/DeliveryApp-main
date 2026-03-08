import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  createProduct,
  createSupplier,
  deleteCustomer,
  deleteProduct,
  deleteQuote,
  deleteSupplier,
  fetchAdminUsers,
  fetchDashboardStats,
  fetchLowStockProducts,
  fetchOrdersByStatus,
  fetchRecentOrders,
  listCustomers,
  listProducts,
  listQuotes,
  listSuppliers,
  subscribeToDashboardUpdates,
  updateAdminUserRole,
  updateCustomer,
  updateProduct,
  updateQuoteStatus,
  updateSupplier,
  USER_QUERY_KEY,
  type CustomerInsert,
  type CustomerUpdate,
  type ProductInsert,
  type ProductUpdate,
  type QuoteStatus,
  type SupplierInsert,
  type SupplierUpdate,
  type UserRole,
} from "./index";

export const DASHBOARD_STATS_QUERY_KEY = ["admin", "dashboard", "stats"] as const;
export const DASHBOARD_STATUS_QUERY_KEY = ["admin", "dashboard", "orders-by-status"] as const;
export const DASHBOARD_LOW_STOCK_QUERY_KEY = ["admin", "dashboard", "low-stock"] as const;
export const DASHBOARD_RECENT_ORDERS_QUERY_KEY = ["admin", "dashboard", "recent-orders"] as const;
export const PRODUCTS_QUERY_KEY = ["admin", "products"] as const;
export const QUOTES_QUERY_KEY = ["admin", "quotes"] as const;
export const SUPPLIERS_QUERY_KEY = ["admin", "suppliers"] as const;
export const CUSTOMERS_QUERY_KEY = ["admin", "customers"] as const;

export function useDashboardRealtime(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    return subscribeToDashboardUpdates(
      () => {
        queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: DASHBOARD_STATUS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: DASHBOARD_RECENT_ORDERS_QUERY_KEY });
      },
      () => {
        queryClient.invalidateQueries({ queryKey: DASHBOARD_STATS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: DASHBOARD_LOW_STOCK_QUERY_KEY });
      },
    );
  }, [queryClient]);
}

export function useDashboardStatsQuery() {
  return useQuery({ queryKey: DASHBOARD_STATS_QUERY_KEY, queryFn: fetchDashboardStats });
}

export function useOrdersByStatusQuery() {
  return useQuery({ queryKey: DASHBOARD_STATUS_QUERY_KEY, queryFn: fetchOrdersByStatus });
}

export function useLowStockProductsQuery() {
  return useQuery({ queryKey: DASHBOARD_LOW_STOCK_QUERY_KEY, queryFn: fetchLowStockProducts });
}

export function useRecentOrdersQuery() {
  return useQuery({ queryKey: DASHBOARD_RECENT_ORDERS_QUERY_KEY, queryFn: fetchRecentOrders });
}

export function useProductsQuery() {
  return useQuery({ queryKey: PRODUCTS_QUERY_KEY, queryFn: listProducts });
}

export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductInsert) => createProduct(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdate }) => updateProduct(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY }),
  });
}

export function useQuotesQuery() {
  return useQuery({ queryKey: QUOTES_QUERY_KEY, queryFn: listQuotes });
}

export function useUpdateQuoteStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: QuoteStatus }) => updateQuoteStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEY }),
  });
}

export function useDeleteQuoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUOTES_QUERY_KEY }),
  });
}

export function useSuppliersQuery() {
  return useQuery({ queryKey: SUPPLIERS_QUERY_KEY, queryFn: listSuppliers });
}

export function useCreateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SupplierInsert) => createSupplier(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY }),
  });
}

export function useUpdateSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SupplierUpdate }) => updateSupplier(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY }),
  });
}

export function useDeleteSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSupplier(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SUPPLIERS_QUERY_KEY }),
  });
}

export function useCustomersQuery() {
  return useQuery({ queryKey: CUSTOMERS_QUERY_KEY, queryFn: listCustomers });
}

export function useCreateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerInsert) => createCustomer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY }),
  });
}

export function useUpdateCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CustomerUpdate }) => updateCustomer(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY }),
  });
}

export function useDeleteCustomerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCustomer(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY }),
  });
}

export function useAdminUsersQuery() {
  return useQuery({ queryKey: USER_QUERY_KEY, queryFn: fetchAdminUsers });
}

export function useUpdateAdminUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { userId: string; role: UserRole | null }) => updateAdminUserRole(params),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY }),
  });
}
