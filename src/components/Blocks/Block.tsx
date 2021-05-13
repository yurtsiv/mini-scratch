import { get } from 'lodash'
import React, { ForwardedRef, RefObject, SVGProps } from 'react'
import ReactDOM from 'react-dom'
import { SetterOrUpdater } from 'recoil'
import { Block as BlockT, BlockType, BlocksState } from 'state/scriptEditor'

import { useBlock } from './useBlock'

type Props = {
  path: string
  setBlocksState: SetterOrUpdater<BlocksState>
  blocksState: BlocksState
  editorRef: RefObject<SVGElement>
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

export function Block({ editorRef, blocksState, path, setBlocksState }: Props) {
  const block = get(blocksState, path) as BlockT

  const { draggingCoords, ref } = useBlock({
    blocksState,
    path,
    setBlocksState,
  })

  // console.log('RENDERING', block, draggingCoords, path)

  const coords = draggingCoords ? draggingCoords : block.coords

  const renderResult = (
    <g
      stroke={draggingCoords ? 'red' : ''}
      transform={`translate(${coords.x}, ${coords.y})`}
    >
      <BlockPath
        ref={ref}
        fill={block.type === BlockType.Ghost ? '#CCC' : '#4C97FF'}
      />
      {block.next ? (
        <Block
          editorRef={editorRef}
          blocksState={blocksState}
          path={`${path}.next`}
          setBlocksState={setBlocksState}
        />
      ) : null}
    </g>
  )

  if (draggingCoords && path.length > 1) {
    return ReactDOM.createPortal(renderResult, editorRef.current as SVGElement)
  }

  return renderResult
}
