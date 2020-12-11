import { useRef, useEffect, useState } from 'react';
import querystring, { UrlObject } from 'query-string';

export function usePrevious<T>(value: T) {
  // The ref object is a generic container whose current property is mutable ...
  // ... and can hold any value, similar to an instance property on a class
  const ref = useRef<T>();

  // Store current value in ref
  useEffect(() => {
    ref.current = value;
  }, [value]); // Only re-run if value changes

  // Return previous value (happens before update in useEffect above)
  return ref.current;
}

export function useArrayState<T>(value: T[]) {
  const [state, set] = useState(value)

  const append = (val: T) => set(state => {
    state = state.slice()
    state.push(val)
    return state
  })

  const remove = (val: T) => set(state => {
    state = state.slice()
    state.splice(state.indexOf(val), 1)
    return state
  })

  const concat = (val: T[]) => set(state => {
    return [...state, ...val]
  })

  return [
    state,
    {
      toggle: (val: T) => {
        if (state.includes(val)) remove(val)
        else append(val)
      },
      append,
      remove,
      concat
    }
  ] as const
}

type URLStateOptions<H> = {
  updateURL: (stateObj: any) => void
  serialiseStateToObject: (key: string, state: H) => any
}

export function useURLState <H = any>(
  key: string,
  stateHook: (initialValue: string | string[] | null) => H,
  options?: Partial<URLStateOptions<H>>
) {
  const {
    serialiseStateToObject,
    updateURL
  } = Object.assign(
    {
      serialiseStateToObject: (key, state) => ({
        [key]: (state as any).toString()
      }),
      updateURL: (query) => window.history.replaceState({}, document.title, querystring.stringifyUrl({
        url: window.location.toString(),
        query
      }))
    } as URLStateOptions<H>,
    options
  )

  // Look for intiial value from `key`
  const initialValue = querystring.parseUrl(window.location.toString()).query[key]

  // Initialise state
  const state = stateHook(initialValue)

  // Update URL when state changes
  useEffect(() => {
    updateURL(serialiseStateToObject(key, state))
  }, [state])

  // Pass through state
  return state
}
