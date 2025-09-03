import { Link, Outlet, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import ThemeToggle from "./components/ThemeToggle"; // no braces

export default function App() {
  const { pathname } = useLocation();
  const Tab = ({ to, children }: { to: string; children: ReactNode }) => (
    <Link
      className={`px-3 py-2 rounded-xl ${
        pathname === to
          ? "bg-blue-600 text-white"
          : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700"
      }`}
      to={to}
    >
      {children}
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="font-semibold">Kinneret 3D BioGeo Dashboard</div>
          <nav className="flex gap-2">
            <Tab to="/">Overview</Tab>
            <Tab to="/timeseries">Time-Series</Tab>
            <Tab to="/spatial">Spatial</Tab>
            <Tab to="/parameters">Parameters</Tab>
            <Tab to="/calibration">Calibration</Tab>
          </nav>
          <div className="ml-auto" />
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6 text-gray-900 dark:text-gray-200">
        <Outlet />
      </main>
    </div>
  );
}