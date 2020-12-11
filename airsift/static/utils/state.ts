import { useRef, useEffect, useState } from 'react';

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
