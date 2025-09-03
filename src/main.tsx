import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Overview from "./pages/Overview";
import Timeseries from "./pages/Timeseries";
import Spatial from "./pages/Spatial";
import Parameters from "./pages/Parameters";
import Calibration from "./pages/Calibration";


// Set API client to MOCK for now (ONE LINE to change later)
import { setApi } from "./services/api";
import { mockApi } from "./services/mockApi";
setApi(mockApi); // ← when ready, swap to httpApi

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Overview /> },
      { path: "timeseries", element: <Timeseries /> },
      { path: "spatial", element: <Spatial /> },
      { path: "parameters", element: <Parameters /> },
      { path: "calibration", element: <Calibration /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);