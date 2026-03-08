import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import NotFound from "@/pages/NotFound";
import { adminRoutes } from "./adminRoutes";
import { publicRoutes } from "./publicRoutes";

export const appRoutes: RouteObject[] = [
  ...publicRoutes,
  ...adminRoutes,
  { path: "/vendedor", element: <Navigate to="/admin/dashboard" replace /> },
  { path: "/orcamentos", element: <Navigate to="/catalogo" replace /> },
  { path: "*", element: <NotFound /> },
];
