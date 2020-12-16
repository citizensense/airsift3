import { DustboxFeature, ObservationFeature } from './types';
import React, { Fragment, useState, useRef, useEffect, useContext, memo } from 'react';
import { useDustboxReading, airQualityColour, airQualityLegend } from './data';
import MapGL, { MapContext, Marker, Popup, NavigationControl, GeolocateControl } from '@urbica/react-map-gl'
import { AirQualityFuzzball, DustboxCard } from './card';
import { useHoverContext, hoverIdAtom, hoverSourceAtom, hoverTypeAtom } from './layout';
import { WebMercatorViewport } from '@math.gl/web-mercator';
import bbox from '@turf/bbox';
import { bboxToBounds } from '../utils/geo';
import { usePrevious } from '../utils/state';
import { useAtom } from 'jotai';
import { A } from 'hookrouter';
import { ObservationCard } from './observation';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import mapboxgl from 'mapbox-gl';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';

export const Map: React.FC<{
  dustboxAddresses: DustboxFeature[]
  observationAddresses: ObservationFeature[]
  mapboxApiAccessToken: string
  mapboxStyleConfig?: string
  className?: string
  defaultZoomLevel?: number
}> = memo(({
  dustboxAddresses,
  observationAddresses,
  mapboxApiAccessToken,
  mapboxStyleConfig,
  className,
  defaultZoomLevel = 11
}) => {
  const [viewport, setViewport] = useState({
    latitude: 0,
    longitude: 0,
    zoom: 2
  })

  const mapContainerRef = useRef<HTMLDivElement>(null)

  const [hoverId] = useAtom(hoverIdAtom)
  const [hoverType] = useAtom(hoverTypeAtom)
  const [hoverSource] = useAtom(hoverSourceAtom)
  const previousHoverId = usePrevious(hoverId)

  useEffect(() => {
    try {
      const allMapItems = [
        ...(dustboxAddresses || []),
        ...(observationAddresses || [])
      ]

      if (!hoverId && allMapItems?.length) {
        const mapContainerDimensions = {
          width: mapContainerRef.current?.clientWidth || 0,
          height: mapContainerRef.current?.clientHeight || 0
        }

        const parsedViewport = new WebMercatorViewport({
          ...viewport,
          ...mapContainerDimensions
        });

        const addressBounds = bbox({
          type: "FeatureCollection",
          features: allMapItems
        })

        if (addressBounds.every(n => n !== Infinity)) {
          const newViewport = parsedViewport.fitBounds(
            bboxToBounds(addressBounds as any),
            { padding: 150 }
          );

          setViewport({
            ...newViewport,
            zoom: Math.min(newViewport.zoom, defaultZoomLevel)
          })
        }
      }
    } catch(e) {
      console.error("Failed to zoom in")
      console.error(e)
    }
  }, [dustboxAddresses, observationAddresses])

  useEffect(() => {
    try {
      const justUnhovered = (previousHoverId !== undefined && hoverId === undefined)

      const allMapItems = [
        ...(dustboxAddresses || []),
        ...(observationAddresses || [])
      ]

      if (hoverId
        && allMapItems?.length
        && !justUnhovered
        && hoverSource !== 'map'
      ) {
        const mapContainerDimensions = {
          width: mapContainerRef.current?.clientWidth || 0,
          height: mapContainerRef.current?.clientHeight || 0
        }

        const parsedViewport = new WebMercatorViewport({
          ...viewport,
          ...mapContainerDimensions
        });

        const hoveredFeature = allMapItems.find(d => String(d.properties.id) === String(hoverId))

        const addressBounds = bbox({
          type: "FeatureCollection",
          features: [hoveredFeature]
        })

        if (addressBounds.every(n => n !== Infinity)) {
          const newViewport = parsedViewport.fitBounds(
            bboxToBounds(addressBounds as any),
            { padding: 150 }
          );
          setViewport({
            ...newViewport,
            zoom: Math.max(viewport.zoom, defaultZoomLevel)
          })
        }
      }
    } catch(e) {
      console.error("Failed to zoom in")
      console.error(e)
    }
  }, [observationAddresses, dustboxAddresses, hoverId, hoverType, hoverSource, previousHoverId])

  return (
    <div ref={mapContainerRef} className={className}>
      <MapGL
        {...viewport}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapboxStyleConfig}
        accessToken={mapboxApiAccessToken}
        onViewportChange={setViewport}
        viewportChangeMethod='flyTo'
      >
        <GeocodeControl position='top-right' accessToken={mapboxApiAccessToken} />
        <NavigationControl showCompass showZoom position='top-right' />
        <GeolocateControl position='top-right' />
        <DustboxItems addresses={dustboxAddresses || []} />
        <ObservationItems addresses={observationAddresses || []} />
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
  )
})

function GeocodeControl ({ position, accessToken }: {
  accessToken: string,
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
}) {
  const map: mapboxgl.Map = useContext(MapContext)

  useEffect(() => {
    const control = new MapboxGeocoder({
      accessToken,
      mapboxgl
    })

    map?.addControl(
      control,
      position
    )

    return () => {
      map?.removeControl(control)
    }
  }, [map, position])

  return null
}

export const DustboxItems: React.FC<{ addresses: DustboxFeature[] }> = ({ addresses }) => {
  return (
    <Fragment>
      {addresses.map(address => (
        <DustboxMapMarker key={address.properties.id} dustbox={address} />
      ))}
    </Fragment>
  )
}

export const DustboxMapMarker: React.FC<{ dustbox: DustboxFeature }> = memo(({ dustbox }) => {
  const [isHovering, setIsHovering] = useHoverContext(dustbox.properties.id, 'dustbox')
  const dustboxReading = useDustboxReading(dustbox.properties.id, {
    // createdAt: dustbox.properties.lastEntryAt.timestamp
    limit: 1
  })
  const dustboxReadingValue = dustboxReading?.data?.[0]?.pm25

  return (
    <Fragment>
      <Marker
        longitude={dustbox?.geometry?.coordinates[0]}
        latitude={dustbox?.geometry?.coordinates[1]}
      >
        <A
          href={`/dustboxes/inspect/${dustbox.properties.id}`}
          className='block cursor-pointer absolute'
          style={{ transform: 'translate(-50%, -50%)' }}
          onMouseOver={() => setIsHovering(true, 'map')}
          onMouseOut={() => setIsHovering(false, 'map')}
        >
          <AirQualityFuzzball
            reading={dustboxReadingValue}
            size='small'
            withNumber
          />
        </A>
      </Marker>
      {isHovering && (
        <Popup
          className='mapbox-invisible-popup max-w-2xl'
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
})

export const ObservationItems: React.FC<{ addresses: ObservationFeature[] }> = ({ addresses }) => {
  return (
    <Fragment>
      {addresses.map(address => (
        <ObservationMapMarker key={address.properties.id} observation={address} />
      ))}
    </Fragment>
  )
}

export const ObservationMapMarker: React.FC<{ observation: ObservationFeature }> = memo(({ observation }) => {
  const [isHovering, setIsHovering] = useHoverContext(observation.properties.id, 'observation')

  return (
    <Fragment>
      <Marker
        longitude={observation?.geometry?.coordinates[0]}
        latitude={observation?.geometry?.coordinates[1]}
      >
        <A
          href={`/observations/inspect/${observation.properties.id}`}
          className='block cursor-pointer absolute w-2 h-2 bg-darkBlue'
          style={{ transform: 'translate(-50%, -50%)' }}
          onMouseOver={() => setIsHovering(true, 'map')}
          onMouseOut={() => setIsHovering(false, 'map')}
        >
        </A>
      </Marker>
      {isHovering && (
        <Popup
          className='mapbox-invisible-popup max-w-2xl'
          longitude={observation?.geometry?.coordinates[0]}
          latitude={observation?.geometry?.coordinates[1]}
          offset={20}
        >
          <div className='p-2 rounded-lg bg-white'>
            <ObservationCard observation={observation.properties} />
          </div>
        </Popup>
      )}
    </Fragment>
  )
})
