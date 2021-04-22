import React, { useRef, useState, useEffect } from 'react'

export function GoTo() {
  const [active, setActive] = useState(false)
  const ref = useRef<any>(null)
  const [x, setX] = useState(0)
  const [y, sety] = useState(0)

  useEffect(() => {
    if (ref) {
      ref.current.addEventListener('touchmove', (e: TouchEvent) => {
        setX(e.touches[0].clientX)
        sety(e.touches[0].clientY)
      })
    }
    console.log(ref)
  }, [ref])

  return (
    <path
      ref={ref}
      style={{ cursor: 'pointer' }}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onTouchMove={console.log}
      onTouchCancel={() => console.log('cancelled')}
      stroke={active ? 'red' : ''}
      transform={`translate(${x}, ${y})`}
      fill="#4C97FF"
      fillOpacity="1"
      d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 145.3670997619629 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"
    />
  )
}
