import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
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
      className={`rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${className}`}
    >
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div className={`p-3 ${bodyHeightClass}`}>{children}</div>
    </div>
  );
}