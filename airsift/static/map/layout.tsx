import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useMemo, useState, useContext, createContext, useEffect, Fragment } from 'react';
import useSWR from 'swr'
import querystring from 'query-string'
import * as turf from '@turf/helpers'
import { DustboxFeature, Dustboxes, DustboxDetail, Observations, ObservationFeature } from './types';
import { DustboxList, ObservationList } from './sidebar';
import { Map } from './map';
import { atom, useAtom } from 'jotai';
import memoise from 'fast-memoize';
import { useRoutes } from 'hookrouter';
import { DustboxDetailCard } from './detailCard';
import { Footer } from './scaffolding';
import { ObservationDetailCard } from './observation';

const routes = {
  '/dustboxes/inspect/:dustboxIdURLParam': ({ dustboxIdURLParam }: { dustboxIdURLParam: string }) => ({ dustboxIdURLParam }),
  '/dustboxes*': () => ({ listDusboxesURLParam: true }),
  '/observations/inspect/:observationIdURLParam': ({ observationIdURLParam }: { observationIdURLParam: string }) => ({ observationIdURLParam }),
  '/observations*': () => ({ listObservationsURLParam: true }),
}

export function DustboxMap ({
  mapboxApiAccessToken,
  mapboxStyleConfig,
}: {
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
}) {
  // @ts-ignore
  const {
    dustboxIdURLParam,
    listDusboxesURLParam,
    observationIdURLParam,
    listObservationsURLParam,
  } = useRoutes(routes as any) as {
    dustboxIdURLParam?: string
    listDusboxesURLParam?: boolean
    observationIdURLParam?: string
    listObservationsURLParam?: boolean
  }

  const [, setHoverId] = useAtom(setHoverIdAtom)
  const [, setHoverType] = useAtom(setHoverTypeAtom)
  const [, setHoverSource] = useAtom(setHoverSourceAtom)

  useEffect(() => {
    if (dustboxIdURLParam) {
      setHoverId(dustboxIdURLParam)
      setHoverType('dustbox')
      setHoverSource('url')
    } else
    if (observationIdURLParam) {
      setHoverId(observationIdURLParam)
      setHoverType('observation')
      setHoverSource('url')
    }
  }, [observationIdURLParam, dustboxIdURLParam, setHoverId])

  // var/www/data-platform-realtime/axios-vanilla/backend/src/modules/stream/controllers/read/streams.js
  const dustboxes = useSWR<Dustboxes>(querystring.stringifyUrl({
    url: '/citizensense/streams',
    query: { limit: 'off' }
  }), undefined, { revalidateOnFocus: false })

  const dustboxAddresses = useMemo(() => {
    return dustboxes.data?.data
      .filter(d => !!d.location.latitude && !!d.location.longitude)
      .reduce((dustboxAddresses, item) => {
        const feature: DustboxFeature  = turf.feature({
          "type": "Point",
          "coordinates": [item.location.longitude, item.location.latitude] as any
        }, item)
        return [...dustboxAddresses, feature]
      }, [] as Array<DustboxFeature>)
  }, [dustboxes.data])

  const observations = useSWR<Observations.Response>(querystring.stringifyUrl({
    url: '/api/v2/pages/',
    query: {
      type: 'observations.Observation',
      fields: [
        'location',
        'observation_type(title)',
        'datetime',
        'observation_images(image_thumbnail)'
      ].join(',')
    }
  }), undefined, { revalidateOnFocus: false })

  const observationAddresses = useMemo(() => {
    return observations.data?.items
      .filter(d => d.location.type === 'Point')
      .reduce((observationAddresses, item) => {
        const feature: ObservationFeature = turf.feature({
          "type": "Point",
          "coordinates": item.location.coordinates.slice().reverse()
        }, item)
        return [...observationAddresses, feature]
      }, [] as Array<ObservationFeature>)
  }, [observations.data])

  return (
    <div className='grid overflow-y-auto sm:overflow-hidden h-screen w-full -my-6 grid-sidebar-map'>
      { dustboxIdURLParam
        ? <DustboxDetailCard id={dustboxIdURLParam} />
        : listDusboxesURLParam
        ? (
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
            <Footer />
          </div>
        )
        : observationIdURLParam
        ? <ObservationDetailCard id={observationIdURLParam} />
        : listObservationsURLParam ? (
          <div className='flex flex-col sm:h-screen overflow-x-hidden'>
            <div className='px-4 mb-4 pt-6'>
              <h1 className='text-M font-bold mb-2'>Observations</h1>
              <p className='text-S my-4'>Events that might indicate pollution or other activity is occuring. You can refer back to these notes and compare them to data generated by Dustboxes.</p>
              <a className='inline-block text-midDarker bg-light border border-mid rounded-lg py-2 px-3 mb-4 text-S font-semibold hoverable' href='/cms/pages/add/observations/observation/2/'>
                + Add an Observation
              </a>
            </div>
            <hr className='border-brand mx-4' />
            <div className='sm:overflow-y-auto flex-grow'>
              <ObservationList observations={observations.data?.items || []} />
            </div>
            <hr className='border-brand mx-4' />
            <Footer />
          </div>
        ) : null}
      {/* MAP */}
      <Map
        dustboxAddresses={dustboxAddresses || []}
        observationAddresses={observationAddresses || []}
        className='relative hidden sm:block'
        mapboxApiAccessToken={mapboxApiAccessToken}
        mapboxStyleConfig={mapboxStyleConfig}
      />
    </div>
  )
}

type HoverID = string | number
export const hoverIdAtom = atom<HoverID | undefined>(undefined)
const setHoverIdAtom = atom(null, (get, set, value: HoverID | undefined) => set(hoverIdAtom, value))

type HoverType = 'dustbox' | 'observation'
export const hoverTypeAtom = atom<HoverType | undefined>(undefined)
const setHoverTypeAtom = atom(null, (get, set, value: HoverType | undefined) => set(hoverTypeAtom, value))

type HoverSource = 'list' | 'map' | 'url'
export const hoverSourceAtom = atom<HoverSource | undefined>(undefined)
const setHoverSourceAtom = atom(null, (get, set, value: HoverSource | undefined) => set(hoverSourceAtom, value))

export const isFocused = memoise((hoverId: HoverID, type: HoverType) => atom(
  get => get(hoverIdAtom) === hoverId,
  (get, set, hoverId: HoverID | undefined) => set(hoverIdAtom, hoverId)
))

export const useHoverContext = (hoverId: HoverID, type: HoverType) => {
  const [hoverSource, setHoverSource] = useAtom(hoverSourceAtom)
  const [, setHoverType] = useAtom(hoverTypeAtom)
  const [thisIsFocused, setHoverId] = useAtom(isFocused(hoverId, type))
  return [
    thisIsFocused,
    (isHovering: boolean, nextHoverSource: HoverSource) => {
      setHoverSource(nextHoverSource)
      setHoverType(type)
      setHoverId(isHovering ? hoverId : undefined)
    },
    hoverSource
  ] as const
}
