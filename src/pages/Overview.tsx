import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { GroupParam, TimeseriesPoint } from "../types";
import Kpi from "../components/Kpi";

export default function Overview() {
  const [groups, setGroups] = useState<GroupParam[]>([]);
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([]);

  useEffect(() => {
    api.getGroups().then(setGroups);
    api.getTimeseries({}).then(setTimeseries);
  }, []);

  const latestChl = [...timeseries]
    .filter(x => x.variable === "chlorophyll")
    .sort((a, b) => a.date.localeCompare(b.date))
    .at(-1)?.value ?? "–";

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Project Overview</h1>

      <p className="text-sm text-gray-600 dark:text-gray-300">3D physical + biogeochemical model of Lake Kinneret.</p>
      
      {/* Dynamic phytoplankton group cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((g) => (
          <div
            key={g.id}
            className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="font-medium">{g.label}</div>
            <div className="text-xs text-gray-500 dark:text-gray-300">
              μ={g.mu} d⁻¹ · N/P={g.rnp} · Si/P={g.rsip}
            </div>
          </div>
        ))}
      </div>

      {/* Static KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Chl-a (µg/L)" value={latestChl} sub="Latest measurement" />
        <Kpi label="Total P (µg/L)" value="18" sub="latest modeled" />
        <Kpi label="N:P" value="16" sub="Redfield" />
        <Kpi label="Bloom risk" value="Low" sub="Microcystis" />
      </div>
    </div>
  );
}