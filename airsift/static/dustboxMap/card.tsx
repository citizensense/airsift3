import React from 'react'
import { useCoordinateData } from '../utils/geo';
import { useDustboxReading, parseTimestamp, airQualityColour } from './data';
import { Dustbox } from './types';
import { firstOf } from '../utils/array';
import { isValid } from 'date-fns';
import { Spinner } from '../utils';
import { formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';

export const DustboxCard: React.FC<{ dustbox: Dustbox, withFuzzball?: boolean }> = ({ dustbox, withFuzzball }) => {
  const dustboxReading = useDustboxReading(dustbox.id, {
    limit: 1
  })

  const coordinates = useCoordinateData(
    dustbox.location.latitude,
    dustbox.location.longitude
  )

  let latestReadingDate = parseTimestamp(dustbox.lastEntryAt.timestamp)
  let latestReading = dustboxReading?.data?.[0]
  let latestReadingValue
  if (latestReading) {
    latestReadingDate = parseTimestamp(latestReading.createdAt)
    latestReadingValue = parseFloat(latestReading["pm2.5"])
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
              Loading last reading
              </div>
            </div>
            <div>
              <Spinner size='small' />
            </div>
          </div>
        ) : latestReadingValue !== undefined ? (
          <div className='flex w-full justify-between items-end'>
            <div className='pt-1'>
              <span className='text-L font-bold'>{latestReadingValue}</span>
              <span className='pl-2 text-XS uppercase font-cousine'>PM 2.5 (MG/M3)</span>
              <div className='font-cousine mt-1 text-opacity-25 text-black text-XXS uppercase'>
                {formatRelative(latestReadingDate, new Date(), { locale: enGB })}
              </div>
            </div>
            {withFuzzball && <div>
              <AirQualityFuzzball
                size='small'
                reading={latestReadingValue}
              />
            </div>}
          </div>
        ) : null}
      </div>
    </div>
  )
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
