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
    query: { limit: 'off' }
  }))

  const addresses = useMemo(() => {
    return dustboxes.data?.data.reduce((addresses, item) => {
      const feature: turf.Feature<any>  = turf.feature({
        "type": "Point",
        "coordinates": [item.location.longitude, item.location.latitude]
      })
      return [...addresses, feature]
    }, [] as Array<turf.Feature<any>>)
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
        {dustboxes.data?.data.map(dustbox =>
          <DustboxCard dustbox={dustbox} key={dustbox.id} />
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

export const DustboxCard: React.FC<{ dustbox: Dustbox }> = ({ dustbox }) => {
  const dustboxReading = useSWR<{ data?: { ["pm2.5"]: number }[] }>(querystring.stringifyUrl({
    url: `citizensense/collections/stream/${dustbox.id}`,
    query: {
      limit: 1
    }
  }), async url => {
    const res = await fetch(url)
    const data = await res.json()
    return data
  })

  const coordinates = useCoordinateData(dustbox.location.latitude, dustbox.location.longitude)

  return (
    <div class='my-3'>
      <div class='mb-4 font-cousine flex w-full'>
        <h1 class='font-bold text-XXS uppercase'>{dustbox.title}</h1>
        <div class='pl-3 font-bold text-opacity-50 text-black text-XXS uppercase'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </div>
      </div>
      <div>
        <pre>{JSON.stringify(dustboxReading, null, 2)}</pre>
        {/* {!dustboxReading.data ? (
          <span>Loading...</span>
        ) : (
          <Fragment>
            <span class='text-L font-bold'>{dustboxReading?.data?.data[0]["pm2.5"]}</span>
            <span class='text-S uppercase font-cousine'>PM 2.5 (MG/M3)</span>
          </Fragment>
        )} */}
      </div>
    </div>
  )
}

export const MapItems: React.FC<{ addresses: any[] }> = ({ addresses }) => {
  return (
    <Fragment>
      {addresses.map(address => (
        <Marker
          key={address.id}
          longitude={address?.geometry?.coordinates[0]}
          latitude={address?.geometry?.coordinates[1]}
        >
          <div
            className='bg-brand text-white rounded-full overflow-hidden flex flex-row justify-center items-center w-2 h-2 border-2 border-solid border-white'
            style={{
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              cursor: 'default'
            }}
          />
        </Marker>
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
