import React, { ReactChild, useCallback, useRef, useState } from 'react'

import './styles.css'

const MIN_HEIGH = 30

type Props = {
  children: ReactChild
  className?: string
}

export function Resizeable({ children, className }: Props) {
  const [height, setHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleBarMove = useCallback(
    (e) => {
      const touchY = e.touches[0].clientY
      const { top } = containerRef.current?.getBoundingClientRect() as DOMRect

      const height = Math.max(MIN_HEIGH, touchY - top)

      setHeight(height)
    },
    [setHeight]
  )

  return (
    <div
      ref={containerRef}
      className={`resizeable-container ${className}`}
      style={{ height: height ? height : undefined }}
    >
      <div className="resizeable-content">{children}</div>
      <div className="resize-bar">
        <div className="move-bar" onTouchMove={handleBarMove} />
      </div>
    </div>
  )
}
