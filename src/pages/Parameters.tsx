import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { GroupParam } from "../types";

export default function Parameters() {
  const [params, setParams] = useState<GroupParam[]>([]);
  useEffect(() => { api.getGroups().then(setParams); }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Model Parameters</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="p-2 text-left">Group</th>
              <th className="p-2">μ</th>
              <th className="p-2">N/P</th>
              <th className="p-2">Si/P</th>
              <th className="p-2">KsP</th>
              <th className="p-2">KsN</th>
              <th className="p-2">KsFe</th>
            </tr>
          </thead>
          <tbody>
            {params.map((p) => (
              <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700">
                <td className="p-2">{p.label}</td>
                <td className="p-2">{p.mu}</td>
                <td className="p-2">{p.rnp}</td>
                <td className="p-2">{p.rsip}</td>
                <td className="p-2">{p.ksP}</td>
                <td className="p-2">{p.ksN}</td>
                <td className="p-2">{p.ksFe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}