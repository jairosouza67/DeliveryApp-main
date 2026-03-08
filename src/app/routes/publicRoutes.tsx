import type { RouteObject } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Catalogo from "@/pages/Catalogo";
import ProductDetails from "@/pages/ProductDetails";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Contato from "@/pages/Contato";
import Login from "@/pages/Login";

export const publicRoutes: RouteObject[] = [
  { path: "/", element: <Index /> },
  { path: "/catalogo", element: <Catalogo /> },
  { path: "/produto/:id", element: <ProductDetails /> },
  { path: "/produtos", element: <Navigate to="/catalogo" replace /> },
  { path: "/carrinho", element: <Cart /> },
  { path: "/checkout", element: <Checkout /> },
  { path: "/contato", element: <Contato /> },
  { path: "/login", element: <Login /> },
];
