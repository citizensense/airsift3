import React, { useRef, useEffect } from 'react';

export const useRenderTicker = () => {
  const renders = useRef(0)
  useEffect(() => { renders.current += 1 })
  return renders.current
}

export const Debug: React.FC = ({ children }) => <pre>{JSON.stringify(children, null, 2)}</pre>
