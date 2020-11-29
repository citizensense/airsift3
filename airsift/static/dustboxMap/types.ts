import * as turf from '@turf/helpers';

export interface Dustboxes {
  status: number;
  data:   Dustbox[];
}

export interface Dustbox {
  createdAt:     number;
  description:   string;
  deviceNumber:  null | string;
  entriesNumber: number;
  id:            string;
  lastEntryAt:   LastEntryAt;
  location:      Location;
  publicKey:     string;
  slug:          string;
  tags:          any[];
  title:         string;
  updatedAt?:    number;
}

export type DustboxFeature = turf.Feature<turf.Point, Dustbox>

export interface LastEntryAt {
  timestamp: number | string;
  human:     string;
}

export interface Location {
  longitude?: string;
  latitude?:  string;
}

export interface DustboxReading {
  createdAt:   number;
  humidity:    string;
  id:          string;
  pm1:         string;
  pm10:        string;
  "pm2.5":     string;
  streamId:    string;
  temperature: string;
}
