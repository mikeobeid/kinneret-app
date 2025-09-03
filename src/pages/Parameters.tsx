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
        <table className="min-w-full text-sm bg-white border rounded">
          <thead className="bg-gray-50">
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
              <tr key={p.id} className="border-t">
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