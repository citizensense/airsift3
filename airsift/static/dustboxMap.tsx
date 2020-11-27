import MapGL, { Marker, Popup } from '@urbica/react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import ReactDOM from 'react-dom';
import React, { useMemo, useRef, useState, useEffect, Fragment, useContext, createContext } from 'react';
import useSWR from 'swr'
import querystring from 'query-string'
import { WebMercatorViewport } from '@math.gl/web-mercator';
import bbox from '@turf/bbox';
import { MapboxGeoJSONFeature } from 'mapbox-gl';
import * as turf from '@turf/helpers'
import Cluster from '@urbica/react-map-gl-cluster';
import { useCoordinateData } from './utils/geo';
import { firstOf } from './utils/array';
import { Spinner } from './utils';
import { compareDesc, isValid } from 'date-fns'
import { parseTimestamp } from './data/citizensense.net';
import { formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';

const ROOT_ID = 'react-app-dustbox-map';

/**
 * Display a world map with organisations plotted on it
 */
export interface Dustboxes {
  status: number;
  data:   Dustbox[];
}

export interface Dustbox {
  createdAt:     number;
  description:   string;
  deviceNumber:  null | string;
  entriesNumber: number;
  id:            string;
  lastEntryAt:   LastEntryAt;
  location:      Location;
  publicKey:     string;
  slug:          string;
  tags:          any[];
  title:         string;
  updatedAt?:    number;
}

export type DustboxFeature = turf.Feature<turf.Point, Dustbox>

export interface LastEntryAt {
  timestamp: number | string;
  human:     string;
}

export interface Location {
  longitude?: string;
  latitude?:  string;
}

export default () => {
  const root = document.getElementById(ROOT_ID)
  if (root) {
    ReactDOM.render(<DustboxMap
      mapboxApiAccessToken={'pk.eyJ1IjoicGVhY2VpbnNpZ2h0IiwiYSI6ImNqbm9nMHFvNjA1MnQzdm0xaWNxM3l5d3YifQ.pXF7u303bNopP7uyVBK8tA'}
      mapboxStyleConfig='mapbox://styles/peaceinsight/ckggfac010dzg19mo9v8odezw'
    />, root)
  }
}

const airQualityLegend = {
  "N/A": "#8299a5",
  "0-5": "#39f986",
  "5-10": "#f0f27c",
  "10-25": "#ffb48a",
  "25-50": "#ff8695",
  "50+": "#cf96c8",
}

const DustboxFocusContext = createContext<{
  setDustboxId: (id: string | null) => void
  dustboxId: null | string
}>({ setDustboxId: (s) => null, dustboxId: null })

function DustboxMap ({
  mapboxApiAccessToken,
  mapboxStyleConfig,
}: {
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
}) {
  const [dustboxId, setDustboxId] = useState<string | null>(null)

  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2
  })

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

  const mapContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (addresses?.length) {
      try {
        const mapContainerDimensions = {
          width: mapContainerRef.current?.clientWidth || 0,
          height: mapContainerRef.current?.clientHeight || 0
        }
        const parsedViewport = new WebMercatorViewport({
          ...viewport,
          ...mapContainerDimensions
        });
        const bboxToBounds = (n: [number, number, number, number]): [[number, number], [number, number]] => {
          return [[Number(n[0]), Number(n[1])], [Number(n[2]), Number(n[3])]]
        }
        const addressBounds = bbox({ type: "FeatureCollection", features: addresses || [] })
        if (addressBounds.every(n => n !== Infinity)) {
          const newViewport = parsedViewport.fitBounds(
            bboxToBounds(addressBounds as any),
            { padding: 150 }
          );
          setViewport({
            ...newViewport,
            zoom: Math.min(newViewport.zoom, 13)
          })
        }
      } catch(e) {
        console.error("Failed to zoom in", e)
      }
    }
  }, [addresses])

  return (
    <DustboxFocusContext.Provider value={{ setDustboxId, dustboxId }}>
      <div className='grid overflow-hidden h-screen w-full -my-6' style={{
        gridTemplateColumns: "500px 1fr"
      }}>
        {/* List */}
        <div className='overflow-y-auto pt-6'>
          <hr className='border-brand mx-4' />
          {dustboxes.data?.data
          .slice()
          .sort((a, b) => {
            if (!isValid(a.lastEntryAt.timestamp)) return 1
            if (!isValid(b.lastEntryAt.timestamp)) return -1
            return compareDesc(
              parseTimestamp(a.lastEntryAt.timestamp),
              parseTimestamp(b.lastEntryAt.timestamp)
            )
          })
          .map((dustbox, i) =>
            <Fragment key={dustbox.id}>
              <DustboxListItem dustbox={dustbox} key={dustbox.id} />
              {(i < (dustboxes?.data?.data?.length || 0)) && (
                <hr className='border-brand mx-4' />
              )}
            </Fragment>
          )}
        </div>
        {/* MAP */}
        <div ref={mapContainerRef} className='relative'>
          <MapGL
            {...viewport}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapboxStyleConfig}
            accessToken={mapboxApiAccessToken}
            onViewportChange={setViewport}
          >
            <MapItems addresses={addresses || []} />
          </MapGL>
          <div className='font-cousine uppercase text-XS absolute bottom-0 right-0 mr-3 mb-5 p-4 bg-white opacity-75 border border-mid rounded-lg'>
            <div className='font-bold mb-2'>PM2.5 (MG/M3) Concentration</div>
            <div className='flex flex-row w-full'>
              {Object.entries(airQualityLegend).map(([meaning, background]) => (
                <div key={meaning} className='flex-shrink-1 flex-grow-0 w-full'>
                  <div className='h-2' style={{ background }}></div>
                  <div className='mt-1 text-XXS font-bold text-black text-opacity-75'>{meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DustboxFocusContext.Provider>
  )
}

export const DustboxListItem: React.FC<{ dustbox: Dustbox }> = ({ dustbox }) => {
  const [isHovering, setIsHovering] = useDustboxFocusContext(dustbox.id)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref?.current?.parentElement?.querySelector(':hover')) {
      ref?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isHovering, ref])

  return (
    <div
      ref={ref}
      className={`py-4 px-4 ${isHovering ? 'bg-gray-300' : ''}`}
      onMouseOver={() => setIsHovering(true)}
      onMouseOut={() => setIsHovering(false)}
    >
      <DustboxCard dustbox={dustbox} key={dustbox.id} withFuzzball />
    </div>
  )
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

export const AirQualityFuzzball: React.FC<{ reading: number, withFuzzball?: boolean, withNumber?: boolean, size?: 'small' | 'large' }> = ({
  reading, withNumber, size = 'large'
}) => {
  return (
    <div className={`
      text-black inline-flex justify-center items-center text-center font-cousine
      ${size === 'small' ? 'w-5 h-5' : 'w-6 h-6'}
    `} style={{
      backgroundImage: `radial-gradient(${airQualityColour(reading)} 30%, transparent 75%)`
    }}>
      {withNumber && !Number.isNaN(reading) && reading}
    </div>
  )
}

type DustboxReading = {
  createdAt:   number;
  humidity:    string;
  id:          string;
  pm1:         string;
  pm10:        string;
  "pm2.5":     string;
  streamId:    string;
  temperature: string;
}

export const useDustboxReading = (dustboxId: string, query: {
  createdAt?: any
  limit?: any
  page?: any
  date?: any
  dateFrom?: any
  dateTo?: any
}) => {
  return useSWR<Array<DustboxReading>>(query.createdAt === 'never' ? null : querystring.stringifyUrl({
    url: `citizensense/collections/stream/${dustboxId}`,
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

export const DustboxCard: React.FC<{ dustbox: Dustbox, withFuzzball?: boolean }> = ({ dustbox, withFuzzball }) => {
  const dustboxReading = useDustboxReading(dustbox.id, {
    limit: 1
  })

  const coordinates = useCoordinateData(
    dustbox.location.latitude,
    dustbox.location.longitude
  )

  const latestReadingDate = parseTimestamp(dustbox.lastEntryAt.timestamp)
  let latestReading
  if (dustboxReading?.data?.[0]) {
    latestReading = parseFloat(dustboxReading?.data?.[0]?.["pm2.5"])
  }

  return (
    <div className='overflow-hidden'>
      <div className='font-cousine text-XXS font-bold uppercase flex w-full'>
        <h1 className='flex-shrink-0 truncate'>{dustbox.title}</h1>
        <div className='flex-shrink-0 truncate pl-3 text-opacity-50 text-black'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </div>
      </div>
      {/* {process.env.NODE_ENV !== 'production' && (
        <div className='mt-1 font-cousine text-XXS font-bold uppercase flex w-full'>
          <h1 className='text-black text-opacity-25'>{dustbox.id}</h1>
        </div>
      )} */}
      <div>
        {!isValid(latestReadingDate) ? (
          <div className='text-XXS text-opacity-50 mt-2 text-error uppercase font-bold'>No readings yet</div>
        ) : (latestReading === undefined) ? (
          <div className='flex w-full justify-between items-end'>
            <div className='pt-1'>
              <div className='font-cousine mt-1 text-opacity-25 text-black text-XXS uppercase'>
              Loading last reading {formatRelative(latestReadingDate, new Date(), { locale: enGB })}
              </div>
            </div>
            <div>
              <Spinner size='small' />
            </div>
          </div>
        ) : (
          <div className='flex w-full justify-between items-end'>
            <div className='pt-1'>
              <span className='text-L font-bold'>{latestReading}</span>
              <span className='pl-2 text-XS uppercase font-cousine'>PM 2.5 (MG/M3)</span>
              <div className='font-cousine mt-1 text-opacity-25 text-black text-XXS uppercase'>
                Last reading {formatRelative(latestReadingDate, new Date(), { locale: enGB })}
              </div>
            </div>
            {withFuzzball && <div>
              <AirQualityFuzzball
                size='small'
                reading={latestReading}
              />
            </div>}
          </div>
        )}
      </div>
    </div>
  )
}

export const MapItems: React.FC<{ addresses: DustboxFeature[] }> = ({ addresses }) => {
  return (
    <Fragment>
      {addresses.map(address => (
        <DustboxMapMarker key={address.properties.id} dustbox={address} />
      ))}
    </Fragment>
    // <Cluster radius={40} extent={512} nodeSize={64} component={ClusterMarker}>
    //   {addresses.map(address => (
    //     <Marker
    //       key={address.id}
    //       longitude={address?.geometry?.coordinates[0]}
    //       latitude={address?.geometry?.coordinates[1]}
    //     >
    //       <div
    //         className='bg-brand text-white rounded-full overflow-hidden flex flex-row justify-center items-center w-2 h-2 border-2 border-solid border-white'
    //         style={{
    //           position: 'absolute',
    //           transform: 'translate(-50%, -50%)',
    //           cursor: 'default'
    //         }}
    //       />
    //     </Marker>
    //   ))}
    // </Cluster>
  )
}

const useDustboxFocusContext = (dustboxId: string) => {
  const context = useContext(DustboxFocusContext)
  const hooks = [
    context.dustboxId === dustboxId,
    (isHovering: boolean) => context.setDustboxId(isHovering ? dustboxId : null)
  ]
  return hooks as [boolean, (bool: boolean) => void]
}

export const DustboxMapMarker: React.FC<{ dustbox: DustboxFeature }> = ({ dustbox }) => {
  const [isHovering, setIsHovering] = useDustboxFocusContext(dustbox.properties.id)
  const dustboxReading = useDustboxReading(dustbox.properties.id, {
    // createdAt: dustbox.properties.lastEntryAt.timestamp
    limit: 1
  })
  const dustboxReadingValue = parseInt(dustboxReading?.data?.[0]?.["pm2.5"] || "NaN")

  return (
    <Fragment>
      <Marker
        longitude={dustbox?.geometry?.coordinates[0]}
        latitude={dustbox?.geometry?.coordinates[1]}
      >
        <div
          // className='bg-brand text-white rounded-full overflow-hidden flex flex-row justify-center items-center w-2 h-2 border-2 border-solid border-white'
          style={{
            position: 'absolute',
            transform: 'translate(-50%, -50%)',
            cursor: 'default'
          }}
          onMouseOver={() => setIsHovering(true)}
          onMouseOut={() => setIsHovering(false)}
        >
          <AirQualityFuzzball
            reading={dustboxReadingValue}
            size='small'
            withNumber
          />
        </div>
      </Marker>
      {isHovering && (
        <Popup
          className='dustbox-popup'
          longitude={dustbox?.geometry?.coordinates[0]}
          latitude={dustbox?.geometry?.coordinates[1]}
          offset={20}
          sx={{
            background: 'none',
            border: 'none',
            boxShadow: 'none'
          }}>
            <div
              className='p-2 rounded-lg'
              style={{ background: airQualityColour(dustboxReadingValue) }}>
              <DustboxCard dustbox={dustbox.properties} />
            </div>
        </Popup>
      )}
    </Fragment>
  )
}

const ClusterMarker = ({ longitude, latitude, pointCount }: {
  longitude: number
  latitude: number
  pointCount: number
}) => {
  const size = Math.max(30, Math.min(pointCount, 85))
  return (
    <Marker longitude={longitude} latitude={latitude}>
      <div
        className='bg-brandOrange text-white rounded-full overflow-hidden flex flex-row justify-center items-center'
        style={{
          position: 'absolute',
          transform: 'translate(-50%, -50%)',
          width: size,
          height: size,
          cursor: 'default'
        }}
      >
        <div className='p-1'>{pointCount}</div>
      </div>
    </Marker>
  );
}
