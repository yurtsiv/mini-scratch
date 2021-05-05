import { Resizeable } from 'components/Resizeable'
import { ScriptEditor } from 'components/ScriptEditor'
import React from 'react'

const MIN_RESIZEABLE_CONTENT_HEIGHT = 10
const STATIC_CONTENT_HEIGHT = 100

export function Layout() {
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
        maxHeight={
          window.innerHeight -
          STATIC_CONTENT_HEIGHT -
          MIN_RESIZEABLE_CONTENT_HEIGHT
        }
        minHeight={MIN_RESIZEABLE_CONTENT_HEIGHT}
      >
        <ScriptEditor />
      </Resizeable>
      <div
        style={{
          minHeight: MIN_RESIZEABLE_CONTENT_HEIGHT,
        }}
      />
      <div
        style={{
          height: STATIC_CONTENT_HEIGHT,
          backgroundColor: '#eee',
        }}
      />
    </div>
  )
}
