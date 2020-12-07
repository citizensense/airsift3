import useSWR from 'swr';
import { DustboxReading } from './types';
import querystring from 'query-string';

export const useDustboxReading = (dustboxId: string, query: {
  createdAt?: any
  limit?: any
  page?: any
  date?: any
  dateFrom?: any
  dateTo?: any
}) => {
  return useSWR<Array<DustboxReading>>(query.createdAt === 'never' ? null : querystring.stringifyUrl({
    url: `/api/dustboxes/${dustboxId}/readings`,
    query
  }), async url => {
    const res = await fetch(url)
    const data = await res.json()
    return data?.data || []
  }, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 60 * 1000,
    focusThrottleInterval: 60 * 1000
  })
}

export const airQualityLegend = {
  "N/A": "#8299a5",
  "0-5": "#39f986",
  "5-10": "#f0f27c",
  "10-25": "#ffb48a",
  "25-50": "#ff8695",
  "50+": "#cf96c8",
}

export const airQualityColour = (reading: number) => {
  let key: keyof typeof airQualityLegend = 'N/A'
  if (reading > 50) key = '50+'
  if (reading <= 50) key = '25-50'
  if (reading <= 25) key = '10-25'
  if (reading <= 10) key = '5-10'
  if (reading <= 5) key = '0-5'
  return airQualityLegend[key]
}

export const parseTimestamp = (timestamp: number | string) => {
  if (timestamp === 'never') {
    return new Date('never')
  }
  return new Date(parseInt(String(timestamp)))
}
