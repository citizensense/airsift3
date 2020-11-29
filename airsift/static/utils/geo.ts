import useSWR from 'swr';
import querystring from 'query-string';

export const bboxToBounds = (n: [number, number, number, number]): [[number, number], [number, number]] => {
  return [[Number(n[0]), Number(n[1])], [Number(n[2]), Number(n[3])]]
}

export const useCoordinateData = (lat: any | null, lon: any | null) => {
  return useSWR<OpenStreetMapReverseGeocodeResponse | null>(() => {
    if (!lat || !lon) throw new Error("Missing lat/lng")
    return querystring.stringifyUrl({
      url: "https://nominatim.openstreetmap.org/reverse",
      query: {
        lon, lat,
        format: 'json',
        /** https://nominatim.org/release-docs/develop/api/Reverse/#result-limitation
          3 	country
          5 	state
          8 	county
          10 	city
          14 	suburb
          16 	major streets
          17 	major and minor streets
          18 	building
         */
        zoom: 14,
        email: 'https://citizensense.net/about/contact/'
      }
    })
  }, async url => {
    const res = await fetch(url)
    return await res.json()
  }, { revalidateOnFocus: false })
}
export interface OpenStreetMapReverseGeocodeResponse {
  place_id:     number;
  licence:      string;
  osm_type:     string;
  osm_id:       number;
  lat:          string;
  lon:          string;
  place_rank:   number;
  category:     string;
  type:         string;
  importance:   number;
  addresstype:  string;
  name:         string;
  display_name: string;
  address:      Address;
  boundingbox:  string[];
}

export interface Address {
  continent?: string

  country?: string
   country_code?: string

  region?: string
   state?: string
   state_district?: string
   county?: string

  municipality?: string
   city?: string
   town?: string
   village?: string

  city_district?: string
   district?: string
   borough?: string
   suburb?: string
   subdivision?: string

  hamlet?: string
   croft?: string
   isolated_dwelling?: string

  neighbourhood?: string
   allotments?: string
   quarter?: string

  city_block?: string
   residental?: string
   farm?: string
   farmyard?: string
   industrial?: string
   commercial?: string
   retail?: string

  road?: string

  house_number?: string
   house_name?: string

  emergency?: string
   historic?: string
   military?: string
   natural?: string
   landuse?: string
   place?: string
   railway?: string
   man_made?: string
   aerialway?: string
   boundary?: string
   amenity?: string
   aeroway?: string
   club?: string
   craft?: string
   leisure?: string
   office?: string
   mountain_pass?: string
   shop?: string
   tourism?: string
   bridge?: string
   tunnel?: string
   waterway?: string
}
