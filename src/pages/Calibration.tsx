import { useEffect, useState } from "react";
import { api } from "../services/api";
import type { TimeseriesPoint } from "../types";

export default function Calibration() {
  const [observed, setObserved] = useState<TimeseriesPoint[]>([]);
  const [modeled, setModeled] = useState<TimeseriesPoint[]>([]);

  useEffect(() => {
    api.getCalibration({ station: "82" }).then(({ observed, modeled }) => {
      setObserved(observed);
      setModeled(modeled);
    });
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Calibration (Station 82)</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300">Placeholder: will compare modeled vs observed on a chart.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <h2 className="font-medium mb-2">Observed (chlorophyll)</h2>
          <ul className="list-disc pl-5">
            {observed.slice(0, 6).map((x, i) => (
              <li key={i}>{x.date} → {x.value}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-3">
          <h2 className="font-medium mb-2">Modeled (biomass)</h2>
          <ul className="list-disc pl-5">
            {modeled.slice(0, 6).map((x, i) => (
              <li key={i}>{x.date} → {x.value}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}