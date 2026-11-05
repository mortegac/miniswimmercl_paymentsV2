import { useRoutes } from "react-router-dom";

import ErrorPage from "../pages/public/ErrorPage";
import ErrorDataPage from "../pages/public/ErrorDataPage";
import { publicRoutes } from "./PublicRoute";


// import Layout from "../themes";

function Router() {
  const routes = [
    { ...publicRoutes },
    {
      path: "500",
      element: <ErrorDataPage />,
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
  ];

  return useRoutes(routes);
}

export default Router;

