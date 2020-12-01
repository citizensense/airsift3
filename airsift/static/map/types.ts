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

export type ObservationFeature = turf.Feature<turf.Point, Observations.Item>

export namespace Observations {
  export interface Response {
    meta:  ResponseMeta;
    items: Item[];
}

export interface Item {
    id:                 number;
    meta:               ItemMeta;
    title:              string;
    observation_type:   ObservationType;
    datetime:           Date;
    location:           Location;
    observation_images: ObservationImage[];
}

export interface Location {
    type:        string;
    coordinates: number[];
}

export interface ItemMeta {
    type:               string;
    detail_url:         string;
    html_url:           null;
    slug:               string;
    first_published_at: Date;
}

export interface ObservationImage {
    id:              number;
    meta:            ObservationImageMeta;
    image:           Image;
    image_thumbnail: ImageThumbnail;
}

export interface Image {
    id:    number;
    meta:  ImageMeta;
    title: string;
}

export interface ImageMeta {
    type:         string;
    detail_url:   string;
    download_url: string;
}

export interface ImageThumbnail {
    url:    string;
    width:  number;
    height: number;
    alt:    string;
}

export interface ObservationImageMeta {
    type: string;
}

export interface ObservationType {
    id:    number;
    meta:  ObservationImageMeta;
    title: string;
}

export interface ResponseMeta {
    total_count: number;
}

}
