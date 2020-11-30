import React from 'react'
import useSWR from 'swr';
import { DustboxDetail } from './types';
import querystring from 'query-string';

export function DustboxDetailCard ({ id }: { id: string }) {
  const dustbox = useSWR<DustboxDetail.Response>(querystring.stringifyUrl({
    url: `/citizensense/streams/id/${id}`,
    query: { limit: 1, streamId: id }
  }), undefined, { revalidateOnFocus: false })

  const data = dustbox?.data?.data

  return (
    <div>{data ? (
      data.title
    ) : (
      <span className='font-cousine font-normal text-S text-gray-600'>{id}</span>
    )}</div>
  )
}
