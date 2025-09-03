import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: CardProps) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
export function Kpi({ label, value, sub }: {label:string;value:string;sub?:string}) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs text-gray-500 dark:text-gray-300">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">{sub}</div>}
      </CardBody>
    </Card>
  );
}