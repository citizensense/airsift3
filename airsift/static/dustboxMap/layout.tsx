import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useMemo, useState, useContext, createContext, useEffect, Fragment } from 'react';
import useSWR from 'swr'
import querystring from 'query-string'
import * as turf from '@turf/helpers'
import { DustboxFeature, Dustboxes, DustboxDetail } from './types';
import { DustboxList } from './sidebar';
import { Map } from './map';
import { createAtom as atom } from 'dawei';
import memoise from 'fast-memoize';
import { useRoutes } from 'hookrouter';
import { DustboxDetailCard } from './detailCard';

const routes = {
  '/dustboxes/stream/:dustboxIdURLParam': ({ dustboxIdURLParam }: { dustboxIdURLParam: string }) => ({ dustboxIdURLParam }),
  '/dustboxes*': () => ({ dustboxIdURLParam: undefined }),
}

export function DustboxMap ({
  mapboxApiAccessToken,
  mapboxStyleConfig,
}: {
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
}) {
  // @ts-ignore
  const { dustboxIdURLParam } = useRoutes(routes)

  useEffect(() => {
    dustboxIdAtom.set(dustboxIdURLParam)
    hoverSourceAtom.set('url')
  }, [dustboxIdURLParam])

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
    <div className='grid overflow-y-auto sm:overflow-hidden h-screen w-full -my-6 grid-sidebar-map'>
      {/* List */}
      {dustboxIdURLParam
        ? <DustboxDetailCard id={dustboxIdURLParam} />
        : (
          <div className='flex flex-col sm:h-screen overflow-x-hidden'>
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
        )}
      {/* MAP */}
      <Map
        addresses={addresses || []}
        className='relative hidden sm:block'
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapboxStyleConfig={mapboxStyleConfig}
      />
    </div>
  )
}

export const dustboxIdAtom = atom(undefined)
export const hoverSourceAtom = atom('')
export const isFocused = memoise((dustboxId: string) => atom(get => get(dustboxIdAtom) === dustboxId))

export const useDustboxFocusContext = (dustboxId: string) => {
  const [hoverSource] = hoverSourceAtom.use()
  const [currentlyFocused] = isFocused(dustboxId).use()
  return [
    currentlyFocused as boolean,
    (isHovering: boolean, nextHoverSource?: string) => {
      hoverSourceAtom.set(nextHoverSource)
      dustboxIdAtom.set(isHovering ? dustboxId : undefined)
    },
    hoverSource as string | undefined
  ] as const
}
