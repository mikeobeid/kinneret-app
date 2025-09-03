import ThemeToggle from "../components/ThemeToggle";
export default function Settings() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="flex items-center justify-between rounded-xl border p-4 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div>
          <div className="font-medium">Theme</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">Switch between light and dark</div>
        </div>
        <ThemeToggle />
      </div>
      {/* Future: Units (µg/L vs mg/m³), Language (EN/HE), Default station/depth */}
    </div>
  );
}