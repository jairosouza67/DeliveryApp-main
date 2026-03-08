import type { ReactElement } from "react";
import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { AdminRoute } from "@/components/AdminRoute";
import Dashboard from "@/pages/admin/Dashboard";
import Quotes from "@/pages/admin/Quotes";
import Products from "@/pages/admin/Products";
import Suppliers from "@/pages/admin/Suppliers";
import Users from "@/pages/admin/Users";
import Customers from "@/pages/admin/Customers";

const withAdminGuard = (element: ReactElement) => <AdminRoute>{element}</AdminRoute>;

export const adminRoutes: RouteObject[] = [
  { path: "/admin/dashboard", element: withAdminGuard(<Dashboard />) },
  { path: "/admin/pedidos", element: withAdminGuard(<Quotes />) },
  { path: "/admin/quotes", element: <Navigate to="/admin/pedidos" replace /> },
  { path: "/admin/products", element: withAdminGuard(<Products />) },
  { path: "/admin/suppliers", element: withAdminGuard(<Suppliers />) },
  { path: "/admin/users", element: withAdminGuard(<Users />) },
  { path: "/admin/customers", element: withAdminGuard(<Customers />) },
];
