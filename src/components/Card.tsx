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
