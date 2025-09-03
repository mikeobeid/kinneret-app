import axios from "axios";
import type { ApiClient } from "./api";
import type { GroupParam, SpatialCell, Station, TimeseriesPoint } from "../types";

const http = axios.create({ baseURL: import.meta.env.VITE_API_URL });

export const httpApi: ApiClient = {
  async getGroups()       { const {data}=await http.get<GroupParam[]>("/groups"); return data; },
  async getStations()     { const {data}=await http.get<Station[]>("/stations"); return data; },
  async getTimeseries(p)  { const {data}=await http.get<TimeseriesPoint[]>("/timeseries",{ params:p }); return data; },
  async getSpatial(p)     { const {data}=await http.get<SpatialCell[]>("/spatial",{ params:p }); return data; },
  async getCalibration(p) { const {data}=await http.get<{observed:TimeseriesPoint[]; modeled:TimeseriesPoint[]}>("/calibration",{ params:p }); return data; },
};