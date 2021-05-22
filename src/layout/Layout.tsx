import { Resizeable } from 'components/Resizeable'
import { ScriptEditor } from 'components/ScriptEditor'
import React, { useLayoutEffect, useRef, useState } from 'react'

import { runBenchmark } from '../testVM2'

const MIN_RESIZEABLE_CONTENT_HEIGHT = 10
const STATIC_CONTENT_HEIGHT = 100

export function Layout() {
  const stageRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasHeight, setCanvasHeight] = useState(0)

  useLayoutEffect(() => {
    const canvas = stageRef.current as HTMLCanvasElement
    const height = window.screen.height / 2
    canvas.width = window.screen.width
    canvas.height = height
    setCanvasHeight(height)
    runBenchmark()
  }, [])

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
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
          minHeight: MIN_RESIZEABLE_CONTENT_HEIGHT,
        }}
      >
        <ScriptEditor />
      </div>
      <div
        style={{
          height: STATIC_CONTENT_HEIGHT,
          backgroundColor: '#eee',
        }}
      />
    </div>
  )
}
