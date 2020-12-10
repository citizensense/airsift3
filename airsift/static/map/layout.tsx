import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useMemo, useState, useContext, createContext, useEffect, Fragment } from 'react';
import useSWR from 'swr'
import querystring from 'query-string'
import * as turf from '@turf/helpers'
import { DustboxFeature, Dustboxes, DustboxDetail, Observations, ObservationFeature, Dustbox } from './types';
import { DustboxList, ObservationList } from './sidebar';
import { Map } from './map';
import { atom, useAtom } from 'jotai';
import memoise from 'fast-memoize';
import { useRoutes, A } from 'hookrouter';
import { DustboxDetailCard } from './detailCard';
import { Footer } from './scaffolding';
import { ObservationDetailCard } from './observation';

const routes = {
  '/': () => ({ homePageURLParam: true }),
  '/dustboxes/inspect/:dustboxIdURLParam': ({ dustboxIdURLParam }: { dustboxIdURLParam: string }) => ({ dustboxIdURLParam }),
  '/dustboxes*': () => ({ listDusboxesURLParam: true }),
  '/observations/inspect/:observationIdURLParam': ({ observationIdURLParam }: { observationIdURLParam: string }) => ({ observationIdURLParam }),
  '/observations*': () => ({ listObservationsURLParam: true }),
}

export function DustboxMap ({
  userId,
  mapboxApiAccessToken,
  mapboxStyleConfig,
}: {
  userId: string | null
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
}) {
  // @ts-ignore
  const {
    homePageURLParam,
    dustboxIdURLParam,
    listDusboxesURLParam,
    observationIdURLParam,
    listObservationsURLParam,
  } = useRoutes(routes as any) as {
    homePageURLParam?: boolean
    dustboxIdURLParam?: string
    listDusboxesURLParam?: boolean
    observationIdURLParam?: string
    listObservationsURLParam?: boolean
  }

  const [, setUserId] = useAtom(userIdAtom)
  useEffect(() => {
    setUserId(userId)
  }, [userId])

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
  const dustboxes = useSWR<Dustbox[]>(querystring.stringifyUrl({
    url: '/api/v2/dustboxes/',
    query: { limit: 'off' }
  }), undefined, { revalidateOnFocus: false })

  const dustboxAddresses = useMemo(() => {
    return (dustboxes.data ?? [])
      .filter(d => !!d.location)
      .reduce((dustboxAddresses, item) => {
        const feature: DustboxFeature  = turf.feature(item.location, item)
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
      .filter(d => d.location?.type === 'Point')
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
      { homePageURLParam
        ? (
          <div className='flex flex-col sm:h-screen overflow-x-hidden'>
            <div className='px-4 mb-4 pt-6'>
              <p className='text-S my-2'>Air pollution is a planetary health emergency. Air quality monitors are not always located where air pollution is occurring, and citizens might have many reasons to gather data to document and analyze air quality</p>
              <p className='text-S'><b>Airsift</b> brings together information for you to set up a citizen-led monitoring project to keep track of air quality in your area.</p>
            </div>
            <hr className='border-brand mx-4' />
            <div className='sm:overflow-y-auto flex-grow'>
              {[
                {
                  url: '/dustboxes',
                  name: "Dustboxes",
                  description: 'Particulate matter sensors designed by Citizen Sense to measure and compare air quality.',
                  imageURL: "/static/images/Sidebar/Home/dustboxes.png"
                },
                {
                  url: '/observations',
                  name: "Observations",
                  description: 'Gather and browse evidence that might indicate pollution or other activity is occuring.',
                  imageURL: "/static/images/Sidebar/Home/observations.png"
                },
                {
                  url: '/analysis',
                  name: "Analysis",
                  description: 'Explore Dustbox data, create plots and identify air pollution problems.',
                  imageURL: "/static/images/Sidebar/Home/analysis.png"
                },
                {
                  url: '/datastories',
                  name: "Stories",
                  description: 'Draw together different kinds of evidence to narrate the impact that air pollution is having in an area. ',
                  imageURL: "/static/images/Sidebar/Home/datastories.png"
                }
              ].map(item => (
                <Fragment>
                  <a href={item.url} key={item.url} className='flex flex-row justify-between w-full px-4 my-4'>
                    <div>
                      <div className='font-cousine text-XS font-bold uppercase flex w-full'>
                        <h2 className='flex-shrink-0 truncat'>
                          {item.name}
                        </h2>
                      </div>
                      <p className='text-S'>
                        {item.description}
                      </p>
                    </div>
                    <div className='ml-3 flex-shrink-0 relative w-6 h-6 bg-cover bg-center' style={{
                      backgroundImage: `url("${item.imageURL}")`
                    }} />
                  </a>
                  <hr className='border-brand mx-4' />
                </Fragment>
              ))}
            </div>
            <Footer />
          </div>
        ) : dustboxIdURLParam
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
              <a className='button-grey mb-4' href='/user_action_redirect/create_observation'>
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

export const userIdAtom = atom<string | null>(null)

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
