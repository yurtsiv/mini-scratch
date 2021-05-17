/* eslint-disable complexity */

import { BLOCK_HEIGHT } from 'lib/const'
import { Coords } from 'lib/types'
import { get } from 'lodash'
import React, { ForwardedRef, RefObject, SVGProps } from 'react'
import ReactDOM from 'react-dom'
import { SetterOrUpdater } from 'recoil'
import { Block as BlockT, BlocksState, DropDir } from 'state/scriptEditor'

import { useBlock } from './useBlock'

type Props = {
  path: string
  setBlocksState: SetterOrUpdater<BlocksState>
  blocksState: BlocksState
  editorRef: RefObject<SVGElement>
  offset: Coords | null
}

function BlockPathC(
  props: SVGProps<SVGPathElement>,
  ref: ForwardedRef<SVGPathElement>
) {
  return (
    <path
      onDragStart={console.log}
      fillOpacity="1"
      d="m 0,4 A 4,4 0 0,1 4,0 H 12 c 2,0 3,1 4,2 l 4,4 c 1,1 2,2 4,2 h 12 c 2,0 3,-1 4,-2 l 4,-4 c 1,-1 2,-2 4,-2 H 145.3670997619629 a 4,4 0 0,1 4,4 v 40  a 4,4 0 0,1 -4,4 H 48   c -2,0 -3,1 -4,2 l -4,4 c -1,1 -2,2 -4,2 h -12 c -2,0 -3,-1 -4,-2 l -4,-4 c -1,-1 -2,-2 -4,-2 H 4 a 4,4 0 0,1 -4,-4 z"
      ref={ref}
      {...props}
    />
  )
}

const BlockPath = React.forwardRef(BlockPathC)

export function Block({
  editorRef,
  blocksState,
  offset,
  path,
  setBlocksState,
}: Props) {
  const block = get(blocksState, path) as BlockT

  const { draggingCoords, ref, suggestDrop } = useBlock({
    blocksState,
    path,
    setBlocksState,
  })

  const coords = draggingCoords
    ? { ...draggingCoords }
    : block.coords
    ? { ...block.coords }
    : {
        x: 0,
        y: BLOCK_HEIGHT,
      }

  if (offset && !draggingCoords) {
    coords.x += offset.x
    coords.y += offset.y
  }

  const suggestTop = suggestDrop === DropDir.Top
  const suggestBottom = suggestDrop === DropDir.Bottom

  const renderResult = (
    <g
      stroke={draggingCoords ? 'red' : ''}
      transform={`translate(${coords.x}, ${coords.y})`}
    >
      {suggestTop && <BlockPath fill="#CCC" />}
      <BlockPath
        ref={ref}
        fill="#4C97FF"
        transform={suggestTop ? `translate(0, ${BLOCK_HEIGHT})` : ''}
      />
      {block.next ? (
        <Block
          editorRef={editorRef}
          blocksState={blocksState}
          path={`${path}.next`}
          setBlocksState={setBlocksState}
          offset={suggestTop ? { x: 0, y: BLOCK_HEIGHT } : null}
        />
      ) : null}
      {suggestBottom && (
        <BlockPath fill="#CCC" transform={`translate(0, ${BLOCK_HEIGHT})`} />
      )}
    </g>
  )

  if (draggingCoords && path.length > 1) {
    return ReactDOM.createPortal(renderResult, editorRef.current as SVGElement)
  }

  return renderResult
}
