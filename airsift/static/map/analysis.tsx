import React, { useMemo, useState, Fragment } from 'react';
import { Footer } from './scaffolding';
import { useLocationNameCoordinates } from '../utils/geo';
import useDebounce from '../utils/time';
import useSWR from 'swr';
import { Dustbox } from './types';
import querystring from 'query-string';
import distance from '@turf/distance'
import { point } from '@turf/helpers'
import { DustboxList } from './sidebar';
import { DustboxTitle } from './card';
import { Debug } from '../utils/react';
import { useArrayState } from '../utils/state';

export function AnalysisView () {
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
      console.log("from", coordinates.data, "to", d.location?.coordinates)
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

  const [dustboxSelections, dustboxActions] = useArrayState<string>([]);

  const toggleDustbox = (id: string) => {
    dustboxActions.toggle(id)
  }

  return (
    <div className='grid overflow-y-auto sm:overflow-hidden h-screen w-full -my-6 grid-sidebar-map'>
      <div className='flex flex-col sm:h-screen overflow-x-hidden'>
        <div className='px-4 mb-4 pt-6'>
          <h1 className='text-M font-bold mb-2'>Analysis</h1>
          <p className='text-S my-4'>Analyse and download citizen-generated air quality data points. You can use this data analysis tool to explore Dustbox data, create plots and identify air pollution problems.</p>
        </div>
        {/* <hr className='border-brand mx-4' /> */}
        <div className='flex-grow flex flex-col'>
          {/* TODO: Search location */}
          {/* {JSON.stringify(coordinates.data, null, 2)} */}
          <div className='my-4 flex flex-col'>
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
        dateFrom={new Date()}
        dateTo={new Date()}
        visualisationType='line'
        particleMeasure='pm2.5'
        mean='24hours'
      />
    </div>
  )
}

type VisualisationType = 'line' | 'scatter' | 'polar' | 'rose' | 'calendar' | 'time'
type ParticleMeasureType = 'pm1' | 'pm2.5' | 'pm10'
type MeanType = '1min' | '1hour' | '24hours'

export const Visualisation: React.FC<{
  dustboxIds: string[]
  dateFrom: Date
  dateTo: Date
  visualisationType: VisualisationType
  particleMeasure: ParticleMeasureType
  mean: MeanType
  // TODO: Weather
}> = (props) => {
  return (
    <div>
      <div>Visualisation goes here.</div>
      <Debug>{props}</Debug>
    </div>
  )
}
