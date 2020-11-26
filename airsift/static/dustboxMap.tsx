import { h, Component, render, Fragment } from 'preact'
// Preorganisations treeshaking
console.log(h, Component, render)
import MapGL, { Marker, Popup } from '@urbica/react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMemo, useRef, useState, useEffect } from 'preact/hooks';
import useSWR from 'swr'
import querystring from 'query-string'
import { WebMercatorViewport } from '@math.gl/web-mercator';
import bbox from '@turf/bbox';
import { MapboxGeoJSONFeature } from 'mapbox-gl';
import * as turf from '@turf/helpers'
import Cluster from '@urbica/react-map-gl-cluster';
import { useCoordinateData } from './utils/geo';
import { firstOf } from './utils/array';

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
    render(<DustboxMap
      mapboxApiAccessToken={'pk.eyJ1IjoicGVhY2VpbnNpZ2h0IiwiYSI6ImNqbm9nMHFvNjA1MnQzdm0xaWNxM3l5d3YifQ.pXF7u303bNopP7uyVBK8tA'}
      mapboxStyleConfig='mapbox://styles/peaceinsight/ckggfac010dzg19mo9v8odezw'
    />, root)
  }
}

function DustboxMap ({
  mapboxApiAccessToken,
  mapboxStyleConfig,
}: {
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
}) {
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2
  })

  // var/www/data-platform-realtime/axios-vanilla/backend/src/modules/stream/controllers/read/streams.js
  const dustboxes = useSWR<Dustboxes>(querystring.stringifyUrl({
    url: '/citizensense/streams',
    query: { limit: 4 }
  }), undefined, { revalidateOnFocus: false })

  const addresses = useMemo(() => {
    return dustboxes.data?.data.reduce((addresses, item) => {
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
      const parsedViewport = new WebMercatorViewport({
        ...viewport,
        width: mapContainerRef.current.clientWidth,
        height: mapContainerRef.current.clientHeight
      });
      const bboxToBounds = (n: [number, number, number, number]): [[number, number], [number, number]] => {
        return [[n[0], n[1]], [n[2], n[3]]]
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
    }
  }, [addresses])

  return (
    <div class='grid overflow-hidden h-screen w-full -my-6' style={{
      gridTemplateColumns: "500px 1fr"
    }}>
      {/* List */}
      <div class='overflow-y-auto px-4 pt-6'>
        <hr class='border-brand' />
        {dustboxes.data?.data.map((dustbox, i) =>
          <Fragment>
            <DustboxCard dustbox={dustbox} key={dustbox.id} />
            {(i < (dustboxes?.data?.data?.length || 0)) && (
              <hr class='border-brand' />
            )}
          </Fragment>
        )}
      </div>
      {/* MAP */}
      <div ref={mapContainerRef}>
        <MapGL
          {...viewport}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapboxStyleConfig}
          accessToken={mapboxApiAccessToken}
          onViewportChange={setViewport}
        >
          <MapItems addresses={addresses || []} />
        </MapGL>
      </div>
    </div>
  )
}

export const airQualityColour = (reading: number) => {
  const colors = {
    "mid": "#8299a5",
    "highlightGreen": "#39f986",
    "5-10": "#f0f27c",
    "10-25": "#ffb48a",
    "25-50": "#ff8695",
    "50+": "#cf96c8",
  }

  if (reading <= 5) return colors['highlightGreen']
  if (reading <= 10) return colors['5-10']
  if (reading <= 25) return colors['10-25']
  if (reading <= 50) return colors['25-50']
  if (reading > 50) return colors['50+']
  return colors['mid']
}

export const AirQualityFuzzball: React.FC<{ reading: number, hideNumber?: boolean, size?: 'small' | 'large' }> = ({ reading, hideNumber = false, size = 'large' }) => {
  return (
    <div class={`
      text-black inline-flex justify-center items-center text-center font-cousine
      ${size === 'small' ? 'w-5 h-5' : 'w-6 h-6'}
    `} style={{
      backgroundImage: `radial-gradient(${airQualityColour(reading)} 25%, transparent 75%)`
    }}>
      {!hideNumber && !Number.isNaN(reading) && reading}
    </div>
  )
}

export const useDustboxReading = (dustboxId: string, query: {
  createdAt?: any
  limit?: any
  page?: any
  date?: any
  dateFrom?: any
  dateTo?: any
}) => {
  return useSWR<{
    status: number;
    data:   Array<{
      createdAt:   number;
      humidity:    string;
      id:          string;
      pm1:         string;
      pm10:        string;
      "pm2.5":     string;
      streamId:    string;
      temperature: string;
    }>
  }>(querystring.stringifyUrl({
    url: `citizensense/collections/stream/${dustboxId}`,
    query
  }), async url => {
    const res = await fetch(url)
    const data = await res.json()
    return data
  }, { revalidateOnFocus: false })
}

export const DustboxCard: React.FC<{ dustbox: Dustbox }> = ({ dustbox }) => {
  const dustboxReading = useDustboxReading(dustbox.id, {
    createdAt: dustbox.lastEntryAt.timestamp
  })

  const coordinates = useCoordinateData(
    dustbox.location.latitude,
    dustbox.location.longitude
  )

  return (
    <div class='my-4'>
      <div class='font-cousine text-XXS font-bold uppercase flex w-full'>
        <h1 class=''>{dustbox.title}</h1>
        <div class='pl-3 text-opacity-50 text-black'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </div>
      </div>
      {process.env.NODE_ENV !== 'production' && (
        <div class='mt-1 font-cousine text-XXS font-bold uppercase flex w-full'>
          <h1 class='text-black text-opacity-25'>{dustbox.id}</h1>
        </div>
      )}
      <div>
        {!dustboxReading.data ? (
          <div class='text-black text-XS text-opacity-50 mt-2'>
            Loading data...
          </div>
        ) : (
          <div class='flex w-full justify-between'>
            <div class='pt-2'>
              <span class='text-L font-bold'>{dustboxReading?.data?.data[0]["pm2.5"]}</span>
              <span class='pl-2 text-XS uppercase font-cousine'>PM 2.5 (MG/M3)</span>
              <div class='font-cousine mt-1 text-opacity-25 text-black text-XXS uppercase'>
                Last reading at {new Date(dustboxReading?.data?.data[0]?.createdAt || 0).toLocaleString()}
              </div>
            </div>
            <div>
              <AirQualityFuzzball
                reading={parseInt(dustboxReading?.data?.data[0]["pm2.5"]) || 0}
                hideNumber
              />
            </div>
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

export const DustboxMapMarker: React.FC<{ dustbox: DustboxFeature }> = ({ dustbox }) => {
  const dustboxReading = useDustboxReading(dustbox.properties.id, {
    createdAt: dustbox.properties.lastEntryAt.timestamp
  })

  return (
    <Marker
      key={dustbox.properties.id}
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
      >
        <AirQualityFuzzball
          reading={parseInt(dustboxReading?.data?.data[0]["pm2.5"])}
          size='small'
        />
      </div>
    </Marker>
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
