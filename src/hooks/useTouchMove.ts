import React, { useCallback, useRef, useState, useEffect } from 'react'

export function useTouchMove() {
  const touchPointWithinElemRef = useRef({ x: -1, y: -1 })
  const [active, setActive] = useState(false)

  const ref = useRef<any>(null)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useEffect(() => {
    if (ref) {
      ref.current.addEventListener('touchmove', (e: TouchEvent) => {
        const { clientX: touchX, clientY: touchY } = e.touches[0]
        setX(touchX - touchPointWithinElemRef.current.x)
        setY(touchY - touchPointWithinElemRef.current.y)
      })
    }
  }, [ref])

  const activate = useCallback(
    (e: React.TouchEvent<SVGPathElement>) => {
      const elemPos = (e.target as SVGPathElement).getBoundingClientRect()
      const { clientX: touchX, clientY: touchY } = e.touches[0]

      touchPointWithinElemRef.current = {
        x: touchX - elemPos.x,
        y: touchY - elemPos.y,
      }

      setActive(true)
    },
    [touchPointWithinElemRef, setActive]
  )

  const deactivate = useCallback(() => {
    setActive(false)
  }, [setActive])

  return {
    ref,
    activate,
    deactivate,
    active,
    transform: `translate(${x}, ${y})`,
  }
}
