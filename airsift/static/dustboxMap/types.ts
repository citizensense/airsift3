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

export namespace DustboxDetail {
  export interface Response {
    status: number;
    data:   Data;
  }

  export interface Data {
    createdAt:     number;
    description:   string;
    deviceNumber:  string;
    entriesNumber: number;
    id:            string;
    lastEntryAt:   string;
    location:      Location;
    publicKey:     string;
    slug:          string;
    tags:          any[];
    title:         string;
    updatedAt:     number;
  }

  export interface Location {
    bbox:               number[];
    center:             number[];
    context:            Context[];
    geometry:           Geometry;
    id:                 string;
    language:           string;
    "language_en-US":   string;
    place_name:         string;
    "place_name_en-US": string;
    place_type:         string[];
    properties:         Properties;
    relevance:          number;
    text:               string;
    "text_en-US":       string;
    type:               string;
  }

  export interface Context {
    id:               string;
    language:         string;
    "language_en-US": string;
    short_code:       string;
    text:             string;
    "text_en-US":     string;
    wikidata:         string;
  }

  export interface Geometry {
    coordinates: number[];
    type:        string;
  }

  export interface Properties {
    address:    string;
    category:   string;
    foursquare: string;
    landmark:   boolean;
    short_code: string;
    wikidata:   string;
  }
}
