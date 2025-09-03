type KpiProps = {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
};

export default function Kpi({ label, value, sub, className = "" }: KpiProps) {
  return (
    <div
      className={`rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-4">
        <div className="text-xs text-gray-500 dark:text-gray-300">{label}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {sub && (
          <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            {sub}
          </div>
        )}
      </div>
    </div>
  );
}