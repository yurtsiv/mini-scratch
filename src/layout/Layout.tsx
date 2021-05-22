import { Resizeable } from 'components/Resizeable'
import { createVm } from 'lib/vm'
import React, { useLayoutEffect, useRef, useState } from 'react'

import { BottomHalf } from './BottomHalf'
import './styles.css'

const MIN_RESIZEABLE_CONTENT_HEIGHT = 10

const canvasHeight = window.screen.height / 2 - 10
const canvasWidth = window.screen.width

export function Layout() {
  const stageRef = useRef<HTMLCanvasElement | null>(null)
  const [vm, setVm] = useState(null)

  useLayoutEffect(() => {
    setVm(createVm({ stage: { width: canvasWidth, height: canvasHeight } }))
  }, [])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Resizeable
        maxHeight={canvasHeight}
        minHeight={MIN_RESIZEABLE_CONTENT_HEIGHT}
      >
        <canvas ref={stageRef} id="scratch-stage" />
      </Resizeable>
      <div
        style={{
          flex: 1,
          minHeight: MIN_RESIZEABLE_CONTENT_HEIGHT,
          position: 'relative',
        }}
      >
        <BottomHalf vm={vm} />
      </div>
    </div>
  )
}
