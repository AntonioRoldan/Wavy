import { useEffect } from 'react';

export const useWindowEvent = (event, callback) => {
  useEffect(() => {
    window.addEventListener(event, callback, 
      {
        capture: true,
        passive: true
      })
    return () => window.removeEventListener(event, callback)
  }, [event, callback])
}
