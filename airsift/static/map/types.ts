import * as turf from '@turf/helpers';

export interface Dustbox {
    id:            string;
    hasData: boolean;
    createdAt:     Date;
    description:   string;
    deviceNumber:  null | string;
    entriesNumber: number;
    lastEntryAt:   Date | null;
    location:      Location | null;
    publicKey:     string;
    slug:          string;
    title:         string;
    updatedAt:     Date | null;
}
export interface Location {
    type:        'Point';
    coordinates: [number, number];
}

export type DustboxFeature = turf.Feature<turf.Point, Dustbox>

export interface DustboxReadingResult {
  count:    number;
  next:     string;
  previous: null;
  results:  DustboxReading[];
}
export interface DustboxReading {
  createdAt:   null | string | number;
  humidity:    number;
  id:          string;
  pm1:         number;
  pm10:        number;
  pm25:        number;
  temperature: number;
}

export namespace DustboxDetail {
  export interface Data {
    hasData?: boolean
    createdAt:     null | string;
    description:   string;
    deviceNumber:  string;
    entriesNumber: number;
    id:            string;
    lastEntryAt:   null | string;
    location:      Location;
    publicKey:     string;
    slug:          string;
    tags:          any[];
    title:         string;
    updatedAt:     null | string;
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
    datetime:           string;
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

export namespace Observation {
  export interface Response {
    id:                 number;
    meta:               ResponseMeta;
    title:              string;
    body:               string;
    observation_type:   ObservationType;
    datetime:           string;
    location:           Location;
    observation_images: ObservationImage[];
    contributors: User[]
}

export interface User {
  id: number,
  username: string
  name: string
}

export interface Location {
    type:        string;
    coordinates: number[];
}

export interface ResponseMeta {
    type:               string;
    detail_url:         string;
    html_url:           null;
    slug:               string;
    show_in_menus:      boolean;
    seo_title:          string;
    search_description: string;
    first_published_at: Date;
    parent:             Parent;
}

export interface Parent {
    id:    number;
    meta:  ParentMeta;
    title: string;
}

export interface ParentMeta {
    type:       string;
    detail_url: string;
    html_url:   null;
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

}
