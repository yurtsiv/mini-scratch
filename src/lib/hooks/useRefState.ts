import { RefObject, useCallback, useRef, useState } from 'react'

export function useRefState<T>(
  initialState: T
): [RefObject<T>, T, (x: T) => void] {
  const ref = useRef<T>(initialState)
  const [state, setState] = useState<T>(initialState)

  const update = useCallback(
    (newState: T) => {
      ref.current = newState
      setState(newState)
    },
    [setState, ref]
  )

  return [ref, state, update]
}
