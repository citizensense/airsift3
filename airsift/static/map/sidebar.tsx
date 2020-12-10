import { Dustbox, Observations } from './types';
import React, { useEffect, useRef, Fragment, memo } from 'react';
import { DustboxCard } from './card';
import { isValid, compareDesc } from 'date-fns';
import { parseTimestamp } from './data';
import { useHoverContext } from './layout';
import { A } from 'hookrouter';
import { useCoordinateData } from '../utils/geo';
import { firstOf } from '../utils/array';
import { formatRelative } from 'date-fns/esm';
import { enGB } from 'date-fns/esm/locale';
import { ObservationCard } from './observation';

export const DustboxList: React.FC<{ dustboxes: Dustbox[] }> = memo(({ dustboxes }) => {
  return (
    <Fragment>
    {dustboxes
      .slice()
      .sort((a, b) => {
        if (!isValid(a.lastEntryAt?.timestamp)) return 1
        if (!isValid(b.lastEntryAt?.timestamp)) return -1
        return compareDesc(
          parseTimestamp(a.lastEntryAt?.timestamp),
          parseTimestamp(b.lastEntryAt?.timestamp)
        )
      })
      .map((dustbox, i) =>
        <Fragment key={dustbox.id}>
          <DustboxListItem dustbox={dustbox} key={dustbox.id} />
          {(i + 1 < (dustboxes.length || 0)) && (
            <hr className='border-brand mx-4' />
          )}
        </Fragment>
      )
    }</Fragment>
  )
})

export const DustboxListItem: React.FC<{ dustbox: Dustbox }> = memo(({ dustbox }) => {
  const [isHovering, setIsHovering, hoverSource] = useHoverContext(dustbox.id, 'dustbox')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hoverSource === 'map') {
      ref?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isHovering, ref])

  return (
    <div ref={ref}>
      <A
        href={`/dustboxes/inspect/${dustbox.id}`}
        className={`block py-4 px-4 ${isHovering ? 'bg-gray-300' : ''}`}
        onMouseOver={() => setIsHovering(true, 'list')}
        onMouseOut={() => setIsHovering(false, 'list')}
      >
        <DustboxCard dustbox={dustbox} key={dustbox.id} withFuzzball />
      </A>
    </div>
  )
})

export const ObservationList: React.FC<{ observations: Observations.Item[] }> = memo(({ observations }) => {
  return (
    <Fragment>
    {observations
      .slice()
      .sort((a, b) => {
        return compareDesc(
          new Date(a.datetime),
          new Date(b.datetime)
        )
      })
      .map((observation, i) =>
        <Fragment key={observation.id}>
          <ObservationListItem observation={observation} key={observation.id} />
          {(i + 1 < (observations.length || 0)) && (
            <hr className='border-darkBlue mx-4' />
          )}
        </Fragment>
      )
    }</Fragment>
  )
})

export const ObservationListItem: React.FC<{ observation: Observations.Item }> = memo(({ observation }) => {
  const [isHovering, setIsHovering, hoverSource] = useHoverContext(observation.id, 'observation')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (hoverSource === 'map') {
      ref?.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [isHovering, ref])

  return (
    <div ref={ref}>
      <A
        href={`/observations/inspect/${observation.id}`}
        className={`block py-4 px-4 ${isHovering ? 'bg-gray-300' : ''}`}
        onMouseOver={() => setIsHovering(true, 'list')}
        onMouseOut={() => setIsHovering(false, 'list')}
      >
        <ObservationCard observation={observation} key={observation.id} withIcon />
      </A>
    </div>
  )
})
