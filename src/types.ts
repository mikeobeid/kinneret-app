export type GroupId =
  | "Diatom"
  | "Dinoflagellates"
  | "SmallPhyto"
  | "Nfixers"
  | "Microcystis";

export interface GroupParam {
  id: GroupId;
  label: string;
  mu: number;
  rnp: number;
  rfep: number;
  rsip: number;
  ksP: number;
  ksN: number;
  ksFe: number;
}

export interface TimeseriesPoint {
  chl: number;
  date: string;
  station: string;
  depth_m: number;
  variable: "chlorophyll" | "biomass";
  group?: GroupId;
  value: number;
}

export interface SpatialCell {
  season: "winter" | "summer";
  x: number;
  y: number;
  biomassPmm3: number;
}

export interface Station {
  id: string;
  name: string;
  lat: number;
  lon: number;
}