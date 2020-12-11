import React, { useMemo, useState, Fragment, useEffect } from 'react';
import { Footer } from './scaffolding';
import { useLocationNameCoordinates } from '../utils/geo';
import useDebounce from '../utils/time';
import useSWR from 'swr';
import { Dustbox, DustboxReadingResult, DustboxReading } from './types';
import querystring from 'query-string';
import distance from '@turf/distance'
import { point } from '@turf/helpers'
import { DustboxList } from './sidebar';
import { DustboxTitle } from './card';
import { Debug } from '../utils/react';
import { useArrayState, useURLStateFactory } from '../utils/state';
import { ensureArray } from '../utils/array';
import { DustboxFlexibleChart } from './graph';
import { ParentSize } from '@visx/responsive';
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { format, parse, subDays } from 'date-fns/esm'
import { enGB } from 'date-fns/esm/locale';
// import { DateUtils } from 'react-day-picker/types/DateUtils';
import 'react-day-picker/lib/style.css';
import { A } from 'hookrouter';

function parseDate(str: string, formatTemplate: string, locale: any = enGB) {
  const parsed = parse(str, formatTemplate, new Date(), { locale });
  return parsed
  //   if (DateUtils.isDate(parsed)) {
  //     return parsed;
  //   }
  //   return undefined;
  // }
}

function formatDate(date: Date, formatTemplate: string, locale: any = enGB) {
  return format(date, formatTemplate, { locale });
}

export function AnalysisView() {
  const [locationName, setLocationName] = useState('')
  const debouncedLocationName = useDebounce(locationName, 1000)
  const coordinates = useLocationNameCoordinates(debouncedLocationName)

  const dustboxList = useSWR<Dustbox[]>(querystring.stringifyUrl({
    url: '/api/v2/dustboxes/',
    query: {}
  }), undefined, { revalidateOnFocus: false })

  const nearestDustboxes = useMemo(() => {
    const getDistance = (d: Dustbox): number => {
      if (!coordinates.data?.length || !dustboxList.data?.length || !d.location) return NaN
      // console.log("from", coordinates.data, "to", d.location?.coordinates)
      return distance(
        point(coordinates.data as number[]),
        point(d.location?.coordinates),
        { units: 'miles' }
      );
    }

    return dustboxList?.data?.map((a) => {
      return {
        ...a,
        distanceFromSearch: getDistance(a)
      }
    }).sort((a, b) =>
      isNaN(a.distanceFromSearch) ? 1 : isNaN(b.distanceFromSearch) ? -1
        : a.distanceFromSearch - b.distanceFromSearch
    ) || []
  }, [coordinates.data, dustboxList.data])

  const useURLState = useURLStateFactory()

  const [dustboxSelections, dustboxActions] = useURLState(
    'dustboxes',
    (initial) => useArrayState(initial ? ensureArray(initial) as string[] : [])
  )

  const toggleDustbox = (id: string) => {
    dustboxActions.toggle(id)
  }

  const DATE_FORMAT_TEMPLATE = 'P'

  const [dateFrom, setDateFrom] = useURLState(
    'dateFrom',
    date => useState(date ? new Date(date.toString()) : subDays(new Date(), 7)),
    { serialiseStateToObject: (key, [state]) => ({ [key]: state.toISOString() }) }
  )

  const [dateTo, setDateTo] = useURLState(
    'dateTo',
    date => useState(date ? new Date(date.toString()) : subDays(new Date(), 7)),
    { serialiseStateToObject: (key, [state] )=> ({ [key]: state.toISOString() }) }
  )

  const [mean, setMean] = useURLState(
    'mean',
    mean => useState(mean?.toString() || 'day')
  )

  const [mode, setMode] = useURLState(
    'mode',
    mode => useState(mode?.toString() || 'trunc')
  )

  return (
    <div className='grid overflow-y-auto sm:overflow-hidden h-screen w-full -my-6 grid-sidebar-map'>
      <div className='flex flex-col sm:h-screen overflow-x-hidden'>
        <div className='px-4 mb-4 pt-6'>
          <h1 className='text-M font-bold mb-2'>Analysis</h1>
          <p className='text-S my-4'>Analyse and download citizen-generated air quality data points. You can use this data analysis tool to explore Dustbox data, create plots and identify air pollution problems.</p>
        </div>
        {/* <hr className='border-brand mx-4' /> */}
        <div className='flex-grow flex flex-col'>
          <A href='/analysis' className='button-grey'>Reset</A>
          <div className='my-4 flex flex-col'>
            <div className='uppercase text-XS font-cousine font-bold mb-2 px-4 text-softBlack'>
              Select dates
            </div>
            <DayPickerInput
              value={dateFrom}
              onDayChange={(d) => setDateFrom(d)}
              formatDate={formatDate}
              format={DATE_FORMAT_TEMPLATE}
              parseDate={parseDate}
              placeholder={`${format(new Date(), DATE_FORMAT_TEMPLATE)}`}
            />
            <DayPickerInput
              value={dateTo}
              onDayChange={(d) => setDateTo(d)}
              formatDate={formatDate}
              format={DATE_FORMAT_TEMPLATE}
              parseDate={parseDate}
              placeholder={`${format(new Date(), DATE_FORMAT_TEMPLATE)}`}
            />
            <div className='uppercase text-XS font-cousine font-bold mb-2 px-4 text-softBlack'>
              Select data resolution
            </div>
            <select onChange={e => setMean(e.target.value)} defaultValue={mean || undefined} value={mean || undefined}>
              {['minute', 'hour', 'day', 'week', 'month', ['isodow', 'Day of Week']].map((val) => {
                const label = Array.isArray(val) ? val[1] : val
                const value = Array.isArray(val) ? val[0] : val
                return <option key={value} value={value}>{label}</option>
              })}
            </select>
            <div className='uppercase text-XS font-cousine font-bold mb-2 px-4 text-softBlack'>
              Select visualisation mode
            </div>
            <select onChange={e => setMode(e.target.value)} defaultValue={mode || undefined} value={mode || undefined}>
              {['trunc', 'part'].map((val) =>
                <option key={val} value={val}>{val}</option>
              )}
            </select>
            <div className='uppercase text-XS font-cousine font-bold mb-2 px-4 text-softBlack'>
              Select a dustbox
            </div>
            <input
              value={locationName} onChange={e => setLocationName(e.target.value)}
              placeholder='Search Address, Postcode, Landmark'
              className='block py-2 px-3 mx-4 my-2 box-border border border-grey-500 rounded-md'
            />
            {nearestDustboxes.map((dustbox, i) =>
              <div
                key={dustbox.id}
                className={`block pt-4 px-4 ${dustboxSelections.includes(dustbox.id) && 'bg-gray-300'}`}
                onClick={() => toggleDustbox(dustbox.id)}
              >
                <DustboxTitle title={dustbox.title} />
                <div className='mt-1 font-cousine text-XXS font-bold uppercase flex w-full'>
                  <h1 className='text-black text-opacity-25'>{dustbox.id}</h1>
                </div>
                {dustbox.distanceFromSearch !== undefined && !isNaN(dustbox.distanceFromSearch) && (
                  <div className='text-red-500 font-bold pt-2 text-XXS'>
                    {dustbox.distanceFromSearch.toFixed(1)} miles away
                  </div>
                )}
                {(i + 1 < (nearestDustboxes.length || 0)) && (
                  <hr className='border-brand mt-4' />
                )}
              </div>
            )}
          </div>
        </div>
        <hr className='border-brand mx-4' />
        <Footer />
      </div>
      <Visualisation
        dustboxIds={dustboxSelections}
        dateFrom={dateFrom}
        dateTo={dateTo}
        visualisationType='line'
        mean={mean}
        mode={mode}
      />
    </div>
  )
}

type VisualisationType = 'line' | 'scatter' | 'polar' | 'rose' | 'calendar' | 'time'
// type ParticleMeasureType = 'pm1' | 'pm2_5' | 'pm10'
type MeanType = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
type ModeType = 'trunc' | 'part'

export const Visualisation: React.FC<{
  dustboxIds: string[]
  dateFrom?: Date
  dateTo?: Date
  visualisationType: VisualisationType
  // particleMeasure: ParticleMeasureType
  mode: ModeType
  mean: MeanType
  // TODO: Weather
}> = ({ dustboxIds, dateFrom, dateTo, mode, mean }) => {
  const keys = [dustboxIds, dateFrom, dateTo, mode, mean]

  const dustboxStreams = useSWR(
    keys,
    async (dustboxIds, dateFrom, dateTo, mode, mean) => Promise.all(dustboxIds.map(
      async (dustboxId: string) => {
        const url = querystring.stringifyUrl({
          url: `/api/v2/dustboxes/${dustboxId}/aggregates/`,
          query: {
            date_after: dateFrom?.toISOString(),
            date_before: dateTo?.toISOString(),
            mode,
            mean,
            limit: 10000000
          }
        })

        const response = await fetch(url)
        const result = await response.json()
        return {
          dustboxId,
          readings: result as DustboxReading[]
        }
      }
    )),
    // {
    //   refreshWhenHidden: false,
    //   revalidateOnFocus: false,
    //   // revalidateOnMount: false,
    //   revalidateOnReconnect: false
    // }
  )

  return (
    <div className='my-6'>
      <div>Visualisation goes here.</div>
      <Debug>{keys}</Debug>
      <ParentSize>{({ width }) =>
        <DustboxFlexibleChart
          dustboxStreams={dustboxStreams.data || []}
          width={width} height={200}
        />
      }</ParentSize>
    </div>
  )
}
