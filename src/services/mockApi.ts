import type { ApiClient } from "./api";
import type { GroupParam, Station, TimeseriesPoint, SpatialCell } from "../types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return res.json() as Promise<T>;
}

export const mockApi: ApiClient = {
  async getGroups() {
    await sleep(150);
    return getJSON<GroupParam[]>("/mock/groups.json");
  },
  async getStations() {
    await sleep(150);
    return getJSON<Station[]>("/mock/stations.json");
  },
  async getTimeseries() {
    await sleep(200);
    return getJSON<TimeseriesPoint[]>("/mock/timeseries.json");
  },
  async getSpatial() {
    await sleep(200);
    return getJSON<SpatialCell[]>("/mock/spatial_2019.json");
  },
  async getCalibration({ station }) {
    await sleep(200);
    const all = await getJSON<TimeseriesPoint[]>("/mock/timeseries.json");
    const observed = all.filter(x => x.station === station && x.variable === "chlorophyll");
    const modeled  = all.filter(x => x.station === station && x.variable === "biomass");
    return { observed, modeled };
  },
};