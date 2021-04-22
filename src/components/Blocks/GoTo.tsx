import { useTouchMove } from 'hooks/useTouchMove'
import React from 'react'

export function GoTo() {
  const { activate, deactivate, active, ref, transform } = useTouchMove()

  return (
    <path
      ref={ref}
      style={{ cursor: 'pointer' }}
      onTouchStart={activate}
      onTouchEnd={deactivate}
      stroke={active ? 'red' : ''}
      transform={transform}
      fill="#4C97FF"
      fillOpacity="1"
      d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 145.3670997619629 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"
    />
  )
}
