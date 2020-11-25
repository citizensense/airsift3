import useSWR from 'swr';
import querystring from 'query-string';

export const useCoordinateData = (lat: any | null, lon: any | null) => {
  return useSWR<CoordinatesResult | null>(() => {
    if (!lat || !lon) throw new Error("Missing lat/lng")
    return querystring.stringifyUrl({
      url: "https://api.postcodes.io/postcodes",
      query: { lon, lat }
    })
  }, async url => {
    const res = await fetch(url)
    const data = await res.json() as CoordinatesResultPayload
    return data?.result[0] || null
  })
}

export interface CoordinatesResultPayload {
  status: number;
  result: CoordinatesResult[];
}

export interface CoordinatesResult {
  postcode:                   string;
  quality:                    number;
  eastings:                   number;
  northings:                  number;
  country:                    string;
  nhs_ha:                     string;
  longitude:                  number;
  latitude:                   number;
  european_electoral_region:  string;
  primary_care_trust:         string;
  region:                     string;
  lsoa:                       string;
  msoa:                       string;
  incode:                     string;
  outcode:                    string;
  parliamentary_constituency: string;
  admin_district:             string;
  parish:                     string;
  admin_county:               string;
  admin_ward:                 string;
  ced:                        string;
  ccg:                        string;
  nuts:                       string;
  codes:                      Codes;
  distance:                   number;
}

export interface Codes {
  admin_district:             string;
  admin_county:               string;
  admin_ward:                 string;
  parish:                     string;
  parliamentary_constituency: string;
  ccg:                        string;
  ccg_id:                     string;
  ced:                        string;
  nuts:                       string;
}
