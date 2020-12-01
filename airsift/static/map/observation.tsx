import React, { memo } from 'react'
import { Observation, Observations } from './types'
import { formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';
import { A } from 'hookrouter';
import { useCoordinateData } from '../../../staticfiles/utils/geo';
import querystring from 'query-string';
import useSWR from 'swr';
import { firstOf } from '../../../staticfiles/utils/array';

export const ObservationCard: React.FC<{ observation: Observations.Item, withIcon?: boolean }> = memo(({ observation, withIcon }) => {
  // const coordinates = useCoordinateData(
  //   observation?.location?.coordinates[0],
  //   observation?.location?.coordinates[1]
  // )

  const image = observation.observation_images[0]?.image_thumbnail

  return (
    <div className='flex flex-row justify-between w-full'>
      <div>
        <div className='font-cousine text-XXS font-bold uppercase flex w-full'>
          {withIcon && <div className='w-2 h-2 bg-darkBlue mr-3'></div>}
          <h1 className='flex-shrink-0 truncate text-darkBlue mr-3'>
            {observation.observation_type?.title}
          </h1>
          <div className='truncate text-midDarker mr-3'>
            {formatRelative(new Date(observation.datetime), new Date(), { locale: enGB })}
          </div>
        </div>
        {/* <div className='my-1 font-cousine text-XXS font-bold uppercase truncate text-midDarker'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </div> */}
        <div className='text-S text-softBlack my-2'>
          {observation.title}
        </div>
      </div>
      {image ? (
        <div className='flex-shrink-0 relative'>
          <img src={image.url} style={{ filter: 'grayscale(100%)' }} />
          <div className='absolute top-0 left-0 h-full w-full bg-darkBlue blend-screen' />
        </div>
      ) : null}
    </div>
  )
})


export function ObservationDetailCard ({ id }: { id: any }) {
  const observationRes = useSWR<Observation.Response>(querystring.stringifyUrl({
    url: `/api/v2/pages/${id}`,
    query: {
      fields: [
        'observation_type(title)'
      ].join()
    }
  }), undefined, { revalidateOnFocus: false })

  const observation = observationRes.data || undefined

  const coordinates = useCoordinateData(
    observation?.location?.coordinates[1],
    observation?.location?.coordinates[0]
  )

  return (
    <div className='flex flex-col sm:h-screen overflow-x-hidden'>
      <div className='px-4 pt-6 pb-5'>
        <A href='/observations' className='text-midDarker block font-bold font-cousine leading-none'>&larr; All Dustboxes</A>
      </div>
      <div className='flex-grow overlow-y-auto overflow-x-hidden'>
        <div className='font-cousine text-XS font-bold uppercase flex w-full items-baseline px-4'>
          <div className='w-3 h-3 bg-darkBlue mr-3'></div>
          {!!observation?.observation_type.title && <h1 className='flex-shrink-0 truncate text-darkBlue mr-3'>
            {observation?.observation_type.title}
          </h1>}
          {!!observation?.datetime && <div className='truncate text-midDarker mr-3'>
            {formatRelative(new Date(observation?.datetime || 0), new Date(), { locale: enGB })}
          </div>}
        </div>
        <div className='text-M font-semibold my-4 text-softBlack leading-none px-4'>
          {observation?.title || `Observation ${id}`}
        </div>
        <div className='text-S text-softBlack my-2 px-4'>
          Collaborators: ???
        </div>
        <div className='text-S text-softBlack my-2 px-4'>
          {coordinates?.data?.address ? firstOf(coordinates.data.address, ['city', 'county', 'region', 'state', 'town', 'village'], true) : null}
          {coordinates?.data?.address?.country ? `, ${coordinates?.data?.address.country}` : null}
        </div>
        <hr className='border-darkBlue mx-4 my-5' />
        {/* Rich text */}
        <div className='px-4 mt-4 mb-2 text-softBlack block font-bold font-cousine leading-none uppercase'>
          Description
        </div>
        <div className='prose px-4' dangerouslySetInnerHTML={{ __html: observation?.body }} />
        {/* Images */}
        <div className='px-4 mt-4 mb-2 text-softBlack block font-bold font-cousine leading-none uppercase'>
          Media
        </div>
        <div className='mx-4'>
          {observation?.observation_images.map(image => {
            return (
              <img key={image.id} src={image.image.meta.download_url} className='w-full my-2' />
            )
          })}
        </div>
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
