import { DustboxFeature } from './types';
import React, { Fragment, useState, useRef, useEffect, useContext, memo } from 'react';
import { useDustboxReading, airQualityColour, airQualityLegend } from './data';
import MapGL, { Marker, Popup } from '@urbica/react-map-gl'
import { AirQualityFuzzball, DustboxCard } from './card';
import { useDustboxFocusContext, dustboxIdAtom, hoverSourceAtom } from './layout';
import { WebMercatorViewport } from '@math.gl/web-mercator';
import bbox from '@turf/bbox';
import { bboxToBounds } from '../utils/geo';
import { usePrevious } from '../utils/state';
import { A } from 'hookrouter';

export const Map: React.FC<{
  dustboxAddresses: DustboxFeature[]
  observationAddresses: any[]
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

  useEffect(() => {
    try {
      if (!dustboxId) {
        const mapContainerDimensions = {
          width: mapContainerRef.current?.clientWidth || 0,
          height: mapContainerRef.current?.clientHeight || 0
        }
        const parsedViewport = new WebMercatorViewport({
          ...viewport,
          ...mapContainerDimensions
        });

        if (dustboxAddresses?.length) {
          const addressBounds = bbox({ type: "FeatureCollection", features: dustboxAddresses || [] })
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
      }
    } catch(e) {
      console.error("Failed to zoom in")
      console.error(e)
    }
  }, [dustboxAddresses])

  const [dustboxId] = dustboxIdAtom.use()
  const [hoverSource] = hoverSourceAtom.use()
  const previousDustboxId = usePrevious(dustboxId)

  useEffect(() => {
    try {
      const dustboxJustUnhovered = (previousDustboxId !== undefined && dustboxId === undefined)
      if (dustboxId
        && dustboxAddresses?.length
        && !dustboxJustUnhovered
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

        const dustboxAddress = dustboxAddresses.find(d => d.properties.id === dustboxId)
        const addressBounds = bbox({ type: "FeatureCollection", features: [dustboxAddress] || [] })
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
  }, [dustboxAddresses, dustboxId, hoverSource, previousDustboxId])

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
})

export const ObservationItems: React.FC<{ addresses: DustboxFeature[] }> = ({ addresses }) => {
  return (
    <Fragment>
      {addresses.map(address => (
        <ObservationMapMarker key={address.properties.id} observation={address} />
      ))}
    </Fragment>
  )
}

export const ObservationMapMarker: React.FC<{ observation: any }> = memo(({ observation }) => {
  const [isHovering, setIsHovering] = useState(false)
  // const dustboxReading = useDustboxReading(dustbox.properties.id, {
  //   // createdAt: dustbox.properties.lastEntryAt.timestamp
  //   limit: 1
  // })
  // const dustboxReadingValue = parseInt(dustboxReading?.data?.[0]?.["pm2.5"] || "NaN")

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
          onMouseOver={() => setIsHovering(true)}
          onMouseOut={() => setIsHovering(false)}
        >
        </A>
      </Marker>
      {isHovering && (
        <Popup
          className='observation-popup'
          longitude={observation?.geometry?.coordinates[0]}
          latitude={observation?.geometry?.coordinates[1]}
          offset={20}
          sx={{
            background: 'none',
            border: 'none',
            boxShadow: 'none'
          }}>
            <div className='p-2 rounded-lg'>
              {observation.title}
            </div>
        </Popup>
      )}
    </Fragment>
  )
})
