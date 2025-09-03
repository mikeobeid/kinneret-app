import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import type { TimeseriesPoint } from "../types";
import ChartCard from "../components/ChartCard";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

export default function Timeseries() {
  const [rows, setRows] = useState<TimeseriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .getTimeseries({})
      .then((r) => setRows(r))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const grouped: Record<string, { date: string; chlorophyll?: number; biomass?: number }> = {};
    for (const { date, variable, value } of rows) {
      if (!grouped[date]) grouped[date] = { date };
      if (variable === "chlorophyll") grouped[date].chlorophyll = value;
      else if (variable === "biomass") grouped[date].biomass = (grouped[date].biomass ?? 0) + value; // sum groups
    }
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [rows]);

  return (
    <div className="space-y-3 text-gray-900 dark:text-gray-100">
      <h1 className="text-xl font-semibold">Time-Series</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Modeled biomass vs. observed chlorophyll (mock data).
      </p>

      {loading && <div className="text-sm">Loading…</div>}
      {error && <div className="text-sm text-red-600">Failed to load: {error}</div>}

      <ChartCard title="Station 82 — Surface (0 m)" subtitle="Chlorophyll (obs) vs Biomass (model)">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "currentColor" }} tickLine={{ stroke: "currentColor" }} axisLine={{ stroke: "currentColor" }} />
            <YAxis tick={{ fontSize: 11, fill: "currentColor" }} tickLine={{ stroke: "currentColor" }} axisLine={{ stroke: "currentColor" }} />
            <Tooltip contentStyle={{ background: "#111827", color: "#fff", border: "1px solid #1f2937" }} wrapperStyle={{ outline: "none" }} />
            <Legend />
            <Line type="monotone" dataKey="chlorophyll" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="biomass" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}