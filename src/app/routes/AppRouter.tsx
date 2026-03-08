import { BrowserRouter, useRoutes } from "react-router-dom";
import { appRoutes } from "./routeConfig";

const AppRoutes = () => useRoutes(appRoutes);

const AppRouter = () => {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default AppRouter;
