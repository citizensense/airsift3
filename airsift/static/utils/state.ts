import { useRef, useEffect, useState } from 'react';
import querystring, { UrlObject } from 'query-string';
import useDebounce from './time';

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
  serialiseStateToObject: (key: string, state: H) => any
}

export function useURLStateFactory () {
  // const [params, updateParams] = useState({})
  const params = useRef({})
  // const debouncedParams = useDebounce(params, 1000)

  useEffect(() => {
    const interval = setInterval(() => {
      window.history.replaceState({}, document.title, querystring.stringifyUrl({
        url: window.location.toString(),
        query: params.current
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return function <H = [any, any]>(
    key: string,
    stateHook: (initialValue: string | string[] | null) => H,
    options?: Partial<URLStateOptions<H>>
  ) {
    const {
      serialiseStateToObject,
    } = Object.assign(
      {
        serialiseStateToObject: (key, [state]: any) => ({ [key]: state })
      } as URLStateOptions<H>,
      options
    )

    // Look for initial value from `key`
    const initialValue = querystring.parseUrl(window.location.toString()).query[key]

    // Initialise state
    const state = stateHook(initialValue)

    // Update URL object when state changes
    useEffect(() => {
      params.current = ({ ...params.current, ...serialiseStateToObject(key, state) })
    }, [state])

    // Pass through state
    return state
  }
}
