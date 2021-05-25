import { clamp } from 'lodash'
import { RefObject, useEffect, useRef, useState } from 'react'

export function useSvgScroll({ elemRef }: { elemRef: RefObject<SVGGElement> }) {
  const [scrollX, setScrollX] = useState(10)
  const prevTouchXRef = useRef(0)
  const maxScrollRef = useRef(0)

  useEffect(() => {
    if (!elemRef.current) {
      return () => {}
    }

    const elem = elemRef.current
    maxScrollRef.current =
      elem.getBoundingClientRect().width - window.innerWidth + 10

    function onTouchMove(e: TouchEvent) {
      const currentX = e.touches[0].clientX

      const scrollDist = prevTouchXRef.current
        ? Math.abs(currentX - prevTouchXRef.current)
        : 0

      setScrollX((scroll) =>
        clamp(
          currentX > prevTouchXRef.current
            ? scroll + scrollDist
            : scroll - scrollDist,
          -maxScrollRef.current,
          10
        )
      )

      prevTouchXRef.current = currentX
    }

    function onTouchEnd() {
      prevTouchXRef.current = 0
    }

    elem.addEventListener('touchmove', onTouchMove)
    elem.addEventListener('touchend', onTouchEnd)

    return () => {
      elem.removeEventListener('touchmove', onTouchMove)
      elem.removeEventListener('touchend', onTouchEnd)
      prevTouchXRef.current = 0
    }
  }, [elemRef, setScrollX])

  return { scrollX }
}
