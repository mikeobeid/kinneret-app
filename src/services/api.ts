import type { GroupParam, TimeseriesPoint, SpatialCell, Station } from "../types";

export interface ApiClient {
  getGroups(): Promise<GroupParam[]>;
  getStations(): Promise<Station[]>;
  getTimeseries(params: {
    station?: string;
    depth_m?: number;
    group?: string;
    variable?: string;
  }): Promise<TimeseriesPoint[]>;
  getSpatial(params: { season: "summer" | "winter" }): Promise<SpatialCell[]>;
  getCalibration(params: {
    station: string;
  }): Promise<{ observed: TimeseriesPoint[]; modeled: TimeseriesPoint[] }>;
}

export let api: ApiClient; // will be set by source switch
export const setApi = (client: ApiClient) => {
  api = client;
};