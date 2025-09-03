import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Height of the chart area (Tailwind class). Default: h-80 */
  bodyHeightClass?: string;
};

export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  bodyHeightClass = "h-80",
}: Props) {
  return (
    <div
      className={`rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 ${bodyHeightClass}`}>{children}</div>
    </div>
  );
}