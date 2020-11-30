import { Dustbox } from './types';
import React, { useEffect, useRef, Fragment, memo } from 'react';
import { DustboxCard } from './card';
import { isValid, compareDesc } from 'date-fns';
import { parseTimestamp } from './data';
import { useDustboxFocusContext } from './layout';
import { A } from 'hookrouter';

export const DustboxList: React.FC<{ dustboxes: Dustbox[] }> = memo(({ dustboxes }) => {
  return (
    <Fragment>
    {dustboxes
      .slice()
      .sort((a, b) => {
        if (!isValid(a.lastEntryAt.timestamp)) return 1
        if (!isValid(b.lastEntryAt.timestamp)) return -1
        return compareDesc(
          parseTimestamp(a.lastEntryAt.timestamp),
          parseTimestamp(b.lastEntryAt.timestamp)
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
  const [isHovering, setIsHovering, hoverSource] = useDustboxFocusContext(dustbox.id)
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
