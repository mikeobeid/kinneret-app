export function Card({ children, className="" }: any) {
  return (
    <div className={`rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 ${className}`}>
      {children}
    </div>
  );
}
export function CardBody({ children, className="" }: any) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
export function Kpi({ label, value, sub }: {label:string;value:string;sub?:string}) {
  return (
    <Card>
      <CardBody>
        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-2xl font-semibold">{value}</div>
        {sub && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</div>}
      </CardBody>
    </Card>
  );
}