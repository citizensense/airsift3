import React from 'react'
import useSWR from 'swr';
import { DustboxDetail, DustboxReading, Observations } from './types';
import querystring from 'query-string';
import { formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';
import { Spinner } from '../utils';
import { AirQualityReading } from './card';
import { parseTimestamp, useDustboxReading } from './data';
import { A } from 'hookrouter';
import { useCoordinateData } from '../utils/geo';
import { firstOf } from '../utils/array';
import { Dustbox24HourChart } from './graph';
import { ParentSize } from '@visx/responsive'
import { ObservationList } from './sidebar';

export function DustboxDetailCard ({ id }: { id: string }) {
  const dustboxRes = useSWR<DustboxDetail.Data>(querystring.stringifyUrl({
    url: `/api/v2/dustboxes/${id}`,
    query: { limit: 1, streamId: id }
  }), undefined, { revalidateOnFocus: false })

  const relatedObservations = useSWR<Observations.Response>(querystring.stringifyUrl({
    url: `/api/v2/pages/`,
    query: {
      type: 'observations.Observation',
      related_dustboxes: id,
      fields: [
        'location',
        'observation_type(title)',
        'datetime',
        'observation_images(image_thumbnail)'
      ].join(',')
    }
  }), undefined, { revalidateOnFocus: false })

  const dustbox = dustboxRes?.data
  const dustboxReading = useDustboxReading(id, {
    // Readings are 1 min apart
    limit: 60 * 24
  })

  const coordinates = useCoordinateData(
    dustbox?.location?.geometry?.coordinates[1],
    dustbox?.location?.geometry?.coordinates[0]
  )

  let latestReadingDate = parseTimestamp(dustbox?.lastEntryAt)
  let latestReading = dustboxReading?.data?.[0]
  let latestReadingValue
  if (latestReading) {
    latestReadingDate = parseTimestamp(latestReading.createdAt)
    latestReadingValue = parseFloat(latestReading.pm25)
  }

  return (
    <div className='flex flex-col sm:h-screen overflow-x-hidden'>
      <div className='px-4 pt-6 pb-5'>
        <A href='/dustboxes' className='text-midDarker block font-bold font-cousine leading-none'>&larr; All Dustboxes</A>
        <div className='uppercase text-XS font-cousine font-bold mt-5 mb-4 text-softBlack leading-none'>{dustbox?.title || `Dustbox ${id}`}</div>
        <h1 className='text-M font-bold my-4 leading-none'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </h1>
        {dustbox?.createdAt && <div className='text-S text-midDarker'>Launch date: {formatRelative(new Date(dustbox.createdAt), new Date(), { locale: enGB })}</div>}
      </div>
      {/* Readings go here */}
      <hr className='border-brand mx-4' />
      <div className='px-4 py-5 flex-grow'>
        {dustbox?.lastEntryAt === 'never' ? (
          <div className='text-XXS text-opacity-50 mt-2 text-error uppercase font-bold font-cousine'>No readings yet</div>
        ) : (latestReading === undefined) ? (
          <div className='flex w-full justify-between items-center'>
            <div className='pt-1'>
              <div className='font-cousine mt-1 text-opacity-25 text-black text-XXS uppercase'>
                Loading air quality data
              </div>
            </div>
            <div>
              <Spinner size='small' />
            </div>
          </div>
        ) : latestReadingValue !== undefined ? (
          <div>
            <div className='uppercase text-XS font-cousine font-bold mb-2 text-softBlack'>
              Current Reading
            </div>
            <AirQualityReading withFuzzball date={latestReadingDate} reading={latestReadingValue} />
            <div className='my-5'>
              <div className='uppercase text-XS font-cousine font-bold mb-1 text-softBlack'>
                Last 24 hours
              </div>
              <Last24Hours data={dustboxReading.data || []} />
            </div>
          </div>
        ) : null}
      </div>
      <div className='mx-4  my-3'>
        <a className='button-grey' href={querystring.stringifyUrl({ url: '/analysis', query: { dustboxes: id }})}>
          Analyse Data &rarr;
        </a>
      </div>
      {/* Related obs */}
      {!!relatedObservations?.data?.items?.length && (
        <div className='mb-4'>
          <div className='uppercase text-XS font-cousine font-bold mb-2 px-4 text-softBlack'>
            Related Observations
          </div>
          <hr className='border-darkBlue mx-4' />
          <ObservationList observations={relatedObservations.data?.items || []} />
        </div>
      )}
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

export const Last24Hours: React.FC<{ data: DustboxReading[] }> = ({ data }) => {
  const dateRanges = data.map(d => parseTimestamp(d.createdAt))
  const newest = dateRanges[0]
  const oldest = dateRanges[dateRanges.length - 1]
  return (
    <div>
      <div className='font-cousine uppercase text-XXS text-midDarker pb-4'>Between {formatRelative(oldest, new Date(), { locale: enGB })} and {formatRelative(newest, new Date(), { locale: enGB })}</div>
      <ParentSize>{({ width }) =>
        <Dustbox24HourChart data={data} width={width} height={200} />
      }</ParentSize>
    </div>
  )
}
