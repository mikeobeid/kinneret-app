import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { SpatialCell } from "../types";

export default function Spatial() {
  const [cells, setCells] = useState<SpatialCell[]>([]);
  useEffect(() => { api.getSpatial({ season: "summer" }).then(setCells); }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Spatial (placeholder)</h1>
      <p className="text-sm text-gray-600">Coming soon: basic heatmap. Showing {cells.length} cells (summer).</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {cells.slice(0, 12).map((c, i) => (
          <div key={i} className="bg-white border rounded p-2 text-xs">
            ({c.x},{c.y}) · {c.season} · {c.biomassPmm3} P·mm³
          </div>
        ))}
      </div>
    </div>
  );
}