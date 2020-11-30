import React from 'react'
import useSWR from 'swr';
import { DustboxDetail } from './types';
import querystring from 'query-string';
import { formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';
import { isValid } from 'date-fns';
import { Spinner } from '../utils';
import { AirQualityFuzzball } from './card';
import { parseTimestamp, useDustboxReading } from './data';
import { A } from 'hookrouter';
import { useCoordinateData } from '../utils/geo';
import { firstOf } from '../utils/array';

export function DustboxDetailCard ({ id }: { id: string }) {
  const dustboxRes = useSWR<DustboxDetail.Response>(querystring.stringifyUrl({
    url: `/citizensense/streams/id/${id}`,
    query: { limit: 1, streamId: id }
  }), undefined, { revalidateOnFocus: false })

  const dustbox = dustboxRes?.data?.data
  const dustboxReading = useDustboxReading(id, {
    limit: 1
  })

  const coordinates = useCoordinateData(dustbox?.location.geometry.coordinates[1], dustbox?.location.geometry.coordinates[0])

  let latestReadingDate = parseTimestamp(dustbox?.lastEntryAt)
  let latestReading = dustboxReading?.data?.[0]
  let latestReadingValue
  if (latestReading) {
    latestReadingDate = parseTimestamp(latestReading.createdAt)
    latestReadingValue = parseFloat(latestReading["pm2.5"])
  }

  return (
    <div className='flex flex-col sm:h-screen'>
      <div className='px-4 pt-6 pb-5'>
        <A href='/dustboxes' className='text-midDarker block font-bold font-cousine leading-none'>&larr; All Dustboxes</A>
        <div className='uppercase text-XS font-cousine font-bold mt-5 mb-4 text-softBlack leading-none'>{dustbox?.title || id}</div>
        <h1 className='text-M font-bold my-4 leading-none'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </h1>
        {dustbox && <div className='text-S text-midDarker'>Launch date: {formatRelative(parseTimestamp(dustbox?.createdAt), new Date(), { locale: enGB })}</div>}
      </div>
      {/* Readings go here */}
      <hr className='border-brand mx-4' />
      <div className='px-4 py-5 flex-grow'>
        <div className='uppercase text-XS font-cousine font-bold mb-2 text-softBlack'>
          Current Reading
        </div>
        {!isValid(latestReadingDate) ? (
          <div className='text-XXS text-opacity-50 mt-2 text-error uppercase font-bold'>No readings yet</div>
        ) : (latestReading === undefined) ? (
          <div className='flex w-full justify-between items-center'>
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
          <div className='flex w-full justify-between items-center'>
            <div className='pt-1'>
              <span className='text-L font-bold'>{latestReadingValue}</span>
              <span className='pl-2 text-XS uppercase font-cousine'>PM 2.5 (MG/M3)</span>
              <div className='font-cousine mt-1 text-opacity-25 text-black text-XXS uppercase'>
                {formatRelative(latestReadingDate, new Date(), { locale: enGB })}
              </div>
            </div>
            <div>
              <AirQualityFuzzball
                size='small'
                reading={latestReadingValue}
              />
            </div>
          </div>
        ) : null}
      </div>
      {/* Footer */}
      <hr className='border-brand mx-4' />
      <div className='px-4 mt-4 pb-3 uppercase font-cousine text-XS'>
        <img src={'/static/images/citizenSenseLogo.png'} className='mb-3' />
        <a href='https://citizensense.net/about/contact/'>Contact</a>
        <a className='ml-3' href='https://citizensense.net/about/terms/'>Terms &amp; Conditions</a>
      </div>
    </div>
  )
}
