import { Resizeable } from 'components/Resizeable'
import { Stage } from 'components/Stage'
import { createVm, VMContext } from 'lib/vm'
import React, { useLayoutEffect, useState } from 'react'

import { BottomHalf } from './BottomHalf'
import './styles.css'

const MIN_RESIZEABLE_CONTENT_HEIGHT = 10

const canvasHeight = window.screen.height / 2 - 10
const canvasWidth = window.screen.width

export function Layout() {
  const [vm, setVm] = useState<any>(null)

  useLayoutEffect(() => {
    setVm(createVm({ stage: { width: canvasWidth, height: canvasHeight } }))
  }, [])

  return (
    <VMContext.Provider value={vm}>
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
          <Stage />
        </Resizeable>
        <div
          style={{
            flex: 1,
            minHeight: MIN_RESIZEABLE_CONTENT_HEIGHT,
            position: 'relative',
          }}
        >
          <BottomHalf />
        </div>
      </div>
    </VMContext.Provider>
  )
}
