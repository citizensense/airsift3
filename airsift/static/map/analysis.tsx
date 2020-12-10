import React, { useMemo, useState } from 'react';
import { Footer } from './scaffolding';
import { useLocationNameCoordinates } from '../utils/geo';
import useDebounce from '../utils/time';
import useSWR from 'swr';
import { Dustbox } from './types';
import querystring from 'query-string';
import distance from '@turf/distance'
import { point } from '@turf/helpers'
import { DustboxList } from './sidebar';

export function AnalysisView () {
  const [locationName, setLocationName] = useState('')
  const debouncedLocationName = useDebounce(locationName, 1000)
  const coordinates = useLocationNameCoordinates(debouncedLocationName)

  const dustboxes = useSWR<Dustbox[]>(querystring.stringifyUrl({
    url: '/api/v2/dustboxes/',
    query: {}
  }), undefined, { revalidateOnFocus: false })

  const nearestDustboxes = useMemo(() => {
    const getDistance = (d: Dustbox): number => {
      if (!coordinates.data?.length || !dustboxes.data?.length || !d.location) return NaN
      console.log("from", coordinates.data, "to", d.location?.coordinates)
      return distance(
        point(coordinates.data as number[]),
        point(d.location?.coordinates),
        { units: 'miles' }
      );
    }

    return dustboxes?.data?.map((a) => {
        return {
          ...a,
          distanceFromSearch: getDistance(a)
        }
      }).sort((a, b) =>
        isNaN(a.distanceFromSearch) ? -1 : isNaN(b.distanceFromSearch) ? 1
        : b.distanceFromSearch - a.distanceFromSearch
      ) || []
  }, [coordinates.data, dustboxes.data])

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
          <input
            value={locationName} onChange={e => setLocationName(e.target.value)}
            placeholder='Type a location and find nearby dustboxes'
            className='block py-2 px-3 mx-4 my-2 box-border border border-grey-500 rounded-md'
          />
          {/* {JSON.stringify(coordinates.data, null, 2)} */}
          <div className='my-4'>
            <div className='uppercase text-XS font-cousine font-bold mb-2 px-4 text-softBlack'>
            Nearby Dustboxes
            </div>
            <DustboxList dustboxes={nearestDustboxes} renderDetail={dustbox => {
              return dustbox.distanceFromSearch !== undefined && !isNaN(dustbox.distanceFromSearch) && (
                <div className='text-red-500 font-bold py-3 text-XXS'>
                  {dustbox.distanceFromSearch.toFixed(1)} miles away
                </div>
              )
            }} />
          </div>
        </div>
        <hr className='border-brand mx-4' />
        <Footer />
      </div>
      {/* TODO: Visualisation */}
    </div>
  )
}
