import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useMemo, useState, useContext, createContext } from 'react';
import useSWR from 'swr'
import querystring from 'query-string'
import * as turf from '@turf/helpers'
import { DustboxFeature, Dustboxes } from './types';
import { DustboxList } from './sidebar';
import { Map } from './map';
import { atom, Provider, useAtom } from 'jotai';

export function DustboxMap ({
  mapboxApiAccessToken,
  mapboxStyleConfig,
}: {
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
}) {
  // var/www/data-platform-realtime/axios-vanilla/backend/src/modules/stream/controllers/read/streams.js
  const dustboxes = useSWR<Dustboxes>(querystring.stringifyUrl({
    url: '/citizensense/streams',
    query: { limit: 'off' }
  }), undefined, { revalidateOnFocus: false })

  const addresses = useMemo(() => {
    return dustboxes.data?.data
      .filter(d => !!d.location.latitude && !!d.location.longitude)
      .reduce((addresses, item) => {
        const feature: DustboxFeature  = turf.feature({
          "type": "Point",
          "coordinates": [item.location.longitude, item.location.latitude] as any
        }, item)
        return [...addresses, feature]
      }, [] as Array<DustboxFeature>)
  }, [dustboxes.data])

  return (
    <Provider>
      <div className='grid overflow-y-auto sm:overflow-hidden h-screen w-full -my-6 grid-sidebar-map'>
        {/* List */}
        <div className='flex flex-col sm:h-screen'>
          <div className='px-4 mb-4 pt-6'>
            <h1 className='text-M font-bold mb-2'>Dustboxes</h1>
            <p className='text-S'>Dustboxes measure small particles between 1 to 2.5 micrometers (μm), which are effectively designated as particulate matter 2.5 (PM2.5) for this research in order to compare readings to official air quality guidance.</p>
          </div>
          <hr className='border-brand mx-4' />
          <div className='sm:overflow-y-auto flex-grow'>
            <DustboxList dustboxes={dustboxes.data?.data || []} />
          </div>
          <hr className='border-brand mx-4' />
          <div className='px-4 mt-4 pb-3 uppercase font-cousine text-XS'>
            <img src={'/static/images/citizenSenseLogo.png'} className='mb-3' />
            <a href='https://citizensense.net/about/contact/'>Contact</a>
            <a className='ml-3' href='https://citizensense.net/about/terms/'>Terms &amp; Conditions</a>
          </div>
        </div>
        {/* MAP */}
        <Map
          addresses={addresses || []}
          className='relative hidden sm:block'
          mapboxApiAccessToken={mapboxApiAccessToken}
          mapboxStyleConfig={mapboxStyleConfig}
        />
      </div>
    </Provider>
  )
}

export const dustboxFocusData = atom<{ dustboxId?: string, hoverSource?: string }>({ dustboxId: undefined, hoverSource: undefined })

export const useDustboxFocusDataContext = () => {
  return useAtom(dustboxFocusData)
}

export const useDustboxFocusContext = (dustboxId: string) => {
  const [current, set] = useDustboxFocusDataContext()
  const hooks = [
    current.dustboxId === dustboxId,
    (isHovering: boolean, hoverSource: string) => set({
      dustboxId: isHovering ? dustboxId : undefined,
      hoverSource
    }),
    current.hoverSource
  ]
  return hooks as [
    boolean,
    (isHovering: boolean, source?: string) => void,
    string
  ]
}
