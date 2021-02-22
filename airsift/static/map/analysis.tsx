import React, { useMemo, useState, Fragment, useEffect } from 'react';
import { Footer } from './scaffolding';
import { useLocationNameCoordinates, useCoordinateData } from '../utils/geo';
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
import { ensureArray, firstOf } from '../utils/array';
import { DustboxFlexibleChart, means } from './graph';
import { ParentSize, ScaleSVG } from '@visx/responsive';
import DayPickerInput from 'react-day-picker/DayPickerInput'
import { format, parse, subDays, formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';
// import { DateUtils } from 'react-day-picker/types/DateUtils';
import 'react-day-picker/lib/style.css';
import { A } from 'hookrouter';
import { subMonths } from 'date-fns';
import randomcolor from 'randomcolor';
import * as jsonexport from "jsonexport/dist"
import downloadjs from 'downloadjs'

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

function toOptions (arr: (string | [string, string] | null)[]): [string, string][] {
  const _arr = arr.filter(n => !!n) as (string | [string, string])[]
  return _arr.map(val => {
      const label = Array.isArray(val) ? val[1] : val
      const value = Array.isArray(val) ? val[0] : val
      return [value, label]
    })
}

function validateOption (val: string, options: string[], fallback?: typeof options[number]) {
  return options.includes(val) ? val as any : fallback || options[0]
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
    date => useState(date ? new Date(date.toString()) : subMonths(new Date(), 12)),
    { serialiseStateToObject: (key, [state]) => ({ [key]: state.toISOString() }) }
  )

  const [dateTo, setDateTo] = useURLState(
    'dateTo',
    date => useState(date ? new Date(date.toString()) : new Date()),
    { serialiseStateToObject: (key, [state] )=> ({ [key]: state.toISOString() }) }
  )

  const modeOptions = toOptions([
    ['trunc', 'Time Series Plot'],
    ['part', 'Pattern Plot']
  ])
  const [mode, setMode] = useURLState(
    'mode',
    mode => useState<'trunc' | 'part'>(
      validateOption(mode?.toString() || '', modeOptions.map(m => m[0]), 'trunc')
    )
  )

  const meanOptions = toOptions([
    mode === 'part' ? null : 'minute',
    'hour',
    mode === 'part' ? ['isodow', 'Day of Week'] : 'day',
    mode === 'part' ? null : 'week',
    'month',
    mode === 'part' ? null : 'year',
  ])
  const [mean, setMean] = useURLState(
    'mean',
    mean => useState<string>(
      validateOption(mean?.toString() || '', meanOptions.map(m => m[0]), 'month')
    )
  )

  // TODO: Redo all of this validation with a proper validation system
  useEffect(() => {
    if (mode === 'part' && !Object.keys(means).includes(mean)) {
      setMean('isodow')
    } else if (mode === 'trunc' && !['minute', 'hour', 'week', 'month', 'year'].includes(mean)) {
      setMean('day')
    }
  }, [mean, mode])

  const measureOptions = toOptions([
    ['pm1', 'PM1'],
    ['pm25', 'PM2.5'],
    ['pm10', 'PM10'],
    ['humidity', 'Humidity'],
    ['temperature', 'Temperature'],
  ])
  const [measure, setMeasure] = useURLState(
    'measure',
    measure => useState<string>(
      validateOption(measure?.toString() || '', measureOptions.map(m => m[0]), 'pm25')
    )
  )


  const keys = [dustboxSelections, dateFrom, dateTo, mode, mean]

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

        const dres = await fetch(querystring.stringifyUrl({
          url: `/api/v2/dustboxes/${dustboxId}`,
          query: {}
        }))
        const dresult = await dres.json()

        return {
          dustboxId,
          dustbox: dresult,
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

  const download = () => {
    for (const stream of dustboxStreams?.data || []) {
      jsonexport(stream?.readings, function(err, csv) {
        const from = format(dateFrom, 'yyyy-MM-dd')
        const to = format(dateTo, 'yyyy-MM-dd')
        downloadjs(csv, `Airsift - ${stream.dustbox.title} ${mode} ${mean} ${measure} from ${from} to ${to}.csv`, 'text/csv')
      })
    }
  }

  return (
    <div className='grid overflow-y-auto overflow-x-hidden md:overflow-y-hidden md:h-screen w-full -my-6 grid-sidebar-map'>
      <div className='order-2 md:order-1 flex flex-col overflow-y-auto overflow-x-hidden'>
        <div className='px-4 mb-4 pt-4 md:pt-6'>
          <h1 className='text-M font-bold mb-2'>Analysis</h1>
          <p className='text-S my-4'>Analyze and download citizen-generated air quality data. You can use this data analysis tool to explore Dustbox data, create plots and identify air pollution problems.</p>
        </div>
        <div className='mx-4'>
          <a href='/analysis' className='button-grey inline-block'>Reset Options</a>
          <span onClick={download} className='ml-2 button-grey inline-block'>Download Data</span>
        </div>
        <div className='uppercase text-XS font-cousine font-bold mt-2 px-4 text-softBlack'>
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
        <hr className='border-t-1 border-brand my-2 mx-4' />
        <div className='uppercase text-XS font-cousine font-bold mt-2 px-4 text-softBlack'>
          Select measurement
        </div>
        <div className='mx-4 my-2'>
          <select onChange={e => setMeasure(e.target.value as any)} value={measure || undefined}
            className='appearance-none block py-2 px-3 box-border border border-gray-500 rounded-md w-full'>
            {measureOptions.map(([val, label]) =>
              <option key={val} value={val}>{label}</option>
            )}
          </select>
        </div>
        <div className='uppercase text-XS font-cousine font-bold mt-2 px-4 text-softBlack'>
          Select data resolution
        </div>
        <div className='mx-4 my-2'>
          <select onChange={e => setMean(e.target.value)} value={mean || undefined}
            className='appearance-none block py-2 px-3 box-border border border-gray-500 rounded-md w-full'>
            {meanOptions.map(([value, label]) => {
              return <option key={value} value={value}>{label}</option>
            })}
          </select>
        </div>
        <div className='uppercase text-XS font-cousine font-bold mt-2 px-4 text-softBlack'>
          Select visualisation mode
        </div>
        <div className='mx-4 my-2'>
          <select onChange={e => setMode(e.target.value as any)} value={mode || undefined}
            className='appearance-none block py-2 px-3 box-border border border-gray-500 rounded-md w-full'>
            {modeOptions.map(([val, label]) =>
              <option key={val} value={val}>{label}</option>
            )}
          </select>
        </div>
        <div className='uppercase text-XS font-cousine font-bold mt-2 px-4 text-softBlack'>
          Select one or more dustboxes
        </div>
        <input
          value={locationName} onChange={e => setLocationName(e.target.value)}
          placeholder='Search dustbox by address, postcode, landmark'
          className='block py-2 px-3 mx-4 my-2 box-border border border-gray-500 rounded-md'
        />
        {nearestDustboxes
          .filter(n => n.hasData)
          .map((dustbox, i) =>
          <Fragment key={dustbox.id}>
            <DustboxAnalysisCard
              key={dustbox.id}
              dustbox={dustbox}
              onClick={() => toggleDustbox(dustbox.id)}
              isSelected={dustboxSelections.includes(dustbox.id)}
            />
            {(i + 1 < (nearestDustboxes.length || 0)) && (
              <hr className='border-brand mx-4' />
            )}
          </Fragment>
        )}
        <hr className='border-brand mx-4' />
        <Footer />
      </div>
      <div className='flex flex-col items-stretch bg-light overflow-x-auto order-1 md:order-2'>
        <div className='mt-5 md:my-6 flex flex-col justify-center items-center align-middle p-4 h-full'>
          <ParentSize className='flex flex-col justify-center items-center align-middle'>{({ width, height }) =>
            <DustboxFlexibleChart
              isLoading={dustboxStreams.isValidating}
              dustboxStreams={dustboxStreams.data || []}
              width={width}
              height={Math.min(height, 666)}
              measure={measure}
              mode={mode}
              mean={mean}
            />
          }</ParentSize>
        </div>
      </div>
    </div>
  )
}

const DustboxAnalysisCard: React.FC<{
  dustbox: Dustbox & { distanceFromSearch?: number }
  onClick?: any
  isSelected?: boolean
}> = ({ dustbox, onClick, isSelected }) => {
  // const monthlyData = useSWR(
  //   querystring.stringifyUrl({
  //     url: `/api/v2/dustboxes/${dustbox.id}/aggregates/`,
  //     query: {
  //       date_after: new Date('2010-01-01').toISOString(),
  //       date_before: new Date().toISOString(),
  //       mode: 'trunc',
  //       mean: 'month',
  //       limit: 10000000
  //     }
  //   })
  // )

  // const oldest = monthlyData?.data?.[monthlyData?.data.length - 1]?.created_at
  // const newest = monthlyData?.data?.[0]?.created_at

  const coordinates = useCoordinateData(dustbox.location?.coordinates[1], dustbox.location?.coordinates[0])

  return (
    <div
      className={`block py-4 px-4 hover:bg-brand hover:bg-opacity-10`}
      style={{
        background: isSelected ? randomcolor({ seed: dustbox.id, luminosity: 'light' }) : ''
      }}
      onClick={onClick}
    >
      <DustboxTitle title={dustbox.title} />

      {coordinates.data?.address ? <div className='font-cousine text-XXS uppercase truncate mt-1 text-midDarker'>
        {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
        {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
      </div> : null}

      {/* <div className='mt-1 font-cousine text-XXS font-bold uppercase flex w-full'>
        <h1 className='text-black text-opacity-25'>{dustbox.id}</h1>
      </div> */}
      {dustbox.distanceFromSearch !== undefined && !isNaN(dustbox.distanceFromSearch) && (
        <div className='text-red-500 mt-1 text-XXS font-cousine uppercase'>
          <b>{dustbox.distanceFromSearch.toFixed(1)}</b> miles away
        </div>
      )}
      {/* {newest && oldest && <div className='my-2 text-mid'>
        Data between {format(oldest, 'MMM yyyy', { locale: enGB })} and {format(newest, 'MMM yyyy', { locale: enGB })}
      </div>} */}
    </div>
  )
}

type VisualisationType = 'line' | 'scatter' | 'polar' | 'rose' | 'calendar' | 'time'
// type ParticleMeasureType = 'pm1' | 'pm25' | 'pm10'
type MeanType = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'
type ModeType = 'trunc' | 'part'

// export const Visualisation: React.FC<{
//   dustboxIds: string[]
//   dateFrom?: Date
//   dateTo?: Date
//   visualisationType: VisualisationType
//   // particleMeasure: ParticleMeasureType
//   mode: ModeType
//   mean: MeanType
//   measure: string
//   // TODO: Weather
// }> = ({ measure, dustboxIds, dateFrom, dateTo, mode, mean }) => {
//   const keys = [dustboxIds, dateFrom, dateTo, mode, mean]

//   const dustboxStreams = useSWR(
//     keys,
//     async (dustboxIds, dateFrom, dateTo, mode, mean) => Promise.all(dustboxIds.map(
//       async (dustboxId: string) => {
//         const url = querystring.stringifyUrl({
//           url: `/api/v2/dustboxes/${dustboxId}/aggregates/`,
//           query: {
//             date_after: dateFrom?.toISOString(),
//             date_before: dateTo?.toISOString(),
//             mode,
//             mean,
//             limit: 10000000
//           }
//         })

//         const response = await fetch(url)
//         const result = await response.json()

//         const dres = await fetch(querystring.stringifyUrl({
//           url: `/api/v2/dustboxes/${dustboxId}`,
//           query: {}
//         }))
//         const dresult = await dres.json()

//         return {
//           dustboxId,
//           dustbox: dresult,
//           readings: result as DustboxReading[]
//         }
//       }
//     )),
//     // {
//     //   refreshWhenHidden: false,
//     //   revalidateOnFocus: false,
//     //   // revalidateOnMount: false,
//     //   revalidateOnReconnect: false
//     // }
//   )

//   return (
//     <ParentSize className='flex flex-col justify-center items-center align-middle'>{({ width, height }) =>
//       <DustboxFlexibleChart
//         dustboxStreams={dustboxStreams.data || []}
//         width={width} height={Math.min(height, 666)}
//         measure={measure}
//         mode={mode}
//         mean={mean}
//       />
//     }</ParentSize>
//   )
// }
