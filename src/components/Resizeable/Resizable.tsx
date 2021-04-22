import { clamp } from 'lib/numbers'
import React, { ReactNode, useCallback, useRef, useState } from 'react'

import './styles.css'

type Props = {
  maxHeight: number
  minHeight: number
  children: ReactNode
  className?: string
}

export function Resizeable({
  children,
  className = '',
  maxHeight,
  minHeight,
}: Props) {
  const [height, setHeight] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleBarMove = useCallback(
    (e) => {
      const touchY = e.touches[0].clientY
      const { top } = containerRef.current?.getBoundingClientRect() as DOMRect

      const height = clamp(minHeight, maxHeight, touchY - top)

      setHeight(height)
    },
    [maxHeight, minHeight, setHeight]
  )

  return (
    <div
      ref={containerRef}
      className={`resizeable-container ${className}`}
      style={{ height: height ? height : undefined }}
    >
      <div className="resizeable-content">{children}</div>
      <div className="resize-bar" onTouchMove={handleBarMove} />
    </div>
  )
}
